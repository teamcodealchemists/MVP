import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrdersRepositoryMongo } from '../infrastructure/adapters/mongodb/orders.repository.impl';
import { OutboundEventAdapter } from '../infrastructure/adapters/outboundEvent.adapter';
import { OrderSaga } from 'src/interfaces/nats/order.saga';
import { RpcException } from '@nestjs/microservices';

@Injectable()   
export class OrdersService {
    constructor(
    @Inject('ORDERSREPOSITORY')
    private readonly ordersRepositoryMongo: OrdersRepositoryMongo,
    private readonly outboundEventAdapter: OutboundEventAdapter,
    private readonly orderSaga: OrderSaga
    ) {}

    
    async checkOrderExistence(id: OrderId): Promise<boolean>{
        const order = await this.ordersRepositoryMongo.getById(id);
        if(!order) {
            return Promise.resolve(false);
        }
        return Promise.resolve(true);   
    }

    // Update per gli ordini incompleti
    async updateReservedStock(id: OrderId, items: OrderItem[]): Promise<void> {
        // Recupera l'ordine completo
        const order = await this.ordersRepositoryMongo.getById(id);
        
        // Per ogni item nell'ordine, somma la nuova quantità riservata a quella esistente
        const itemsWithUpdatedReservation = order.getItemsDetail().map(itemDetail => {
            // Trova l'item corrispondente nell'array di OrderItem ricevuto
            const matchingItem = items.find(orderItem => 
                orderItem.getItemId() === itemDetail.getItem().getItemId()
            );
            
            if (matchingItem) {
                // SOMMA la quantità riservata esistente con la nuova quantità
                const newQuantityReserved = itemDetail.getQuantityReserved() + matchingItem.getQuantity();
                return new OrderItemDetail(
                    itemDetail.getItem(),
                    newQuantityReserved, // quantity reserved aggiornata
                    itemDetail.getUnitPrice()  
                );
            }
            
            // Se non trova corrispondenza, mantiene l'item originale
            return itemDetail;
        });
        
        // Aggiorna nel repository
        await this.ordersRepositoryMongo.updateReservedStock(id, itemsWithUpdatedReservation);
        
        // Procedi con il flusso normale
        if (order instanceof SellOrder) {
            await this.checkReservedQuantityForSellOrder(order);
        } else if (order instanceof InternalOrder) {
            await this.checkReservedQuantityForInternalOrder(order);
        }
        
        console.log(`Ordine ${id.getId()} - Quantità riservate aggiornate`);
    }

    // Update per gli ordini completi
    async updateFullReservedStock(id: OrderId): Promise<void> {
        // Recupera l'ordine completo
        const order = await this.ordersRepositoryMongo.getById(id);
        
        // Imposta tutte le quantità riservate = quantità ordinate
        const itemsWithFullReservation = order.getItemsDetail().map(item => 
            new OrderItemDetail(
                item.getItem(),
                item.getItem().getQuantity(), // quantity reserved = quantity ordered
                item.getUnitPrice()  
            )
        );
        
        // Aggiorna nel repository
        await this.ordersRepositoryMongo.updateReservedStock(id, itemsWithFullReservation);
        
        // Procedi con il flusso normale
        if (order instanceof SellOrder) {
            await this.checkReservedQuantityForSellOrder(order);
        } else if (order instanceof InternalOrder) {
            await this.checkReservedQuantityForInternalOrder(order);
        }
        
        console.log(`Ordine ${id.getId()} - Tutta la merce è disponibile e riservata`);
    }

/*     async updateOrderState(id: OrderId, state: OrderState): Promise<void> {
        // Aggiorna lo stato nella repository
        await this.ordersRepositoryMongo.updateOrderState(id, state);
        
        // Recupera l'ordine aggiornato
        const updatedOrder = await this.ordersRepositoryMongo.getById(id);
        
        // Invia sync all'aggregato Orders
        const reqReceiver = { destination: 'aggregate' as const};

        if (updatedOrder instanceof SellOrder) {
            await this.outboundEventAdapter.orderState(updatedOrder, reqReceiver);
        } else if (updatedOrder instanceof InternalOrder) {
            await this.outboundEventAdapter.publishInternalOrder(updatedOrder, reqReceiver);
        }
    }     */
    
    async updateOrderState(id: OrderId, newState: OrderState): Promise<void> {
        // Recupera lo stato corrente
        const currentState = await this.ordersRepositoryMongo.getState(id);

        // Controlla la validità della transizione di stato
        // Se è in uno degli Stati finali: non può cambiare
        if (currentState === OrderState.COMPLETED || currentState === OrderState.CANCELED) {
        throw new RpcException('Impossibile violare il corretto flusso di gestione stato dell\'ordine: stato finale raggiunto');
        }
        
        // Regole di transizione
        const allowedTransitions: Record<OrderState, OrderState[]> = {
            [OrderState.PENDING]: [OrderState.PROCESSING, OrderState.CANCELED],
            [OrderState.PROCESSING]: [OrderState.SHIPPED, OrderState.CANCELED],
            [OrderState.SHIPPED]: [OrderState.COMPLETED, OrderState.CANCELED],
            [OrderState.COMPLETED]: [], // Nessuna transizione permessa
            [OrderState.CANCELED]: []   // Nessuna transizione permessa
        };
        
        if (!allowedTransitions[currentState].includes(newState)) {
            throw new RpcException('Impossibile violare il corretto flusso di gestione stato dell\'ordine');
        }


        // Aggiorna lo stato nella repository
        await this.ordersRepositoryMongo.updateOrderState(id, newState);
        

        // Se l'ordine è passato a PROCESSING, notifica WarehouseDeparture
        if (newState === OrderState.PROCESSING) {
            const order = await this.ordersRepositoryMongo.getById(id);
            if (order instanceof InternalOrder) {   
                // Notifica il magazzino di partenza usando receiveShipment
                 console.log(`Notifico magazzino ${order.getWarehouseDeparture()} che può spedire ordine ${id.getId()}`);
                await this.outboundEventAdapter.receiveShipment(
                    id, 
                    [], 
                    order.getWarehouseDeparture()
                );
            }
        }
        await this.outboundEventAdapter.orderStateUpdated(id, newState);
    }    

    async checkOrderState(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.getState(id);
    }


    async createSellOrder(order: SellOrder): Promise<string>{
        let uniqueOrderId: OrderId;
        console.log("Creating sell order:", order);
        // Se l'ID è vuoto, genera nuovo ID, altrimenti usa quello esistente
        if (!order.getOrderId() || order.getOrderId() === '') {
            const newId = await this.ordersRepositoryMongo.genUniqueId('S');
            uniqueOrderId = new OrderId(newId.getId());
        } else {
            uniqueOrderId = new OrderId(order.getOrderId());
        }
        console.log("Creating sell order:", order);
/*         // Controlla se l'ordine esiste già
        const orderExists = await this.checkOrderExistence(uniqueOrderId);
 */        
        // Crea il nuovo ordine
        const orderWithUniqueId = new SellOrder(
            uniqueOrderId,
            order.getItemsDetail(),
            order.getOrderState(),
            order.getCreationDate(),
            order.getWarehouseDeparture(),
            order.getDestinationAddress()
        );
/* 
        // Se l'ordine esiste già, pubblica solo al warehouse di destinazione (inutile rimandarlo all'aggregato)
        if (orderExists) {
            await this.outboundEventAdapter.publishSellOrder(orderWithUniqueId, { 
                destination: 'warehouse', 
                warehouseId: order.getWarehouseDeparture() 
            });
        } else { */
            // Se è nuovo, aggiungi a repo e pubblica sia al warehouse di destinazione che all'aggregate Orders
            await this.ordersRepositoryMongo.addSellOrder(orderWithUniqueId);
            await this.orderSaga.startSellOrderSaga(uniqueOrderId);
            await this.outboundEventAdapter.publishSellOrder(orderWithUniqueId, { destination: 'aggregate' });
            await this.outboundEventAdapter.publishSellOrder(orderWithUniqueId, { 
                destination: 'warehouse', 
                warehouseId: order.getWarehouseDeparture() 
            });
            return Promise.resolve(uniqueOrderId.getId());
    }

    async createInternalOrder(order: InternalOrder): Promise<string>{
        let uniqueOrderId: OrderId;
        
        // Se l'ID è vuoto, genera nuovo ID, altrimenti usa quello esistente
        if (!order.getOrderId() || order.getOrderId()=== '') {
            const newId = await this.ordersRepositoryMongo.genUniqueId('I');
            uniqueOrderId = new OrderId(newId.getId());
        } else {
            uniqueOrderId = new OrderId(order.getOrderId());
        }

        Logger.debug(`Creating internal order with ID: ${uniqueOrderId.getId()}`, 'OrdersService');
        
/*         // Controlla se l'ordine esiste già
        const orderExists = await this.checkOrderExistence(uniqueOrderId);
 */        
        // Crea il nuovo ordine
        const orderWithUniqueId = new InternalOrder(
            uniqueOrderId,
            order.getItemsDetail(),
            order.getOrderState(),
            order.getCreationDate(),
            order.getWarehouseDeparture(),
            order.getWarehouseDestination(),
            order.getSellOrderReference()
        );

/*         // Se l'ordine esiste già, pubblica solo al warehouse di destinazione
        if (orderExists) {
            await this.outboundEventAdapter.publishInternalOrder(orderWithUniqueId, { 
                destination: 'warehouse', 
                warehouseId: order.getWarehouseDestination() 
            });
        } else { */
            // Se è nuovo, aggiungi e pubblica a tutti
            await this.ordersRepositoryMongo.addInternalOrder(orderWithUniqueId);
            await this.orderSaga.startInternalOrderSaga(uniqueOrderId);
            await this.outboundEventAdapter.publishInternalOrder(orderWithUniqueId, { destination: 'aggregate' });
            await this.outboundEventAdapter.publishInternalOrder(orderWithUniqueId, { 
                destination: 'warehouse', 
                warehouseId: order.getWarehouseDestination() 
            });
/*         } */
        return Promise.resolve(uniqueOrderId.getId());
    }


    async cancelOrder(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.removeById(id);
        await this.outboundEventAdapter.orderCancelled(id);
    }


    // CASO STANDARD: Merce parzialmente disponibile 
    async stockReserved(orderId: OrderId, orderItems: OrderItem[]): Promise<void> {
        
        // Recupera l'ordine completo dal repository
        const order = await this.ordersRepositoryMongo.getById(orderId);
        
        // Aggiorna le quantità riservate per ogni item
        const updatedItems = order.getItemsDetail().map(itemDetail => {
            // Trova l'item corrispondente nell'array di OrderItem
            const matchingItem = orderItems.find(orderItem => 
                orderItem.getItemId() === itemDetail.getItem().getItemId()
            );
            
            if (matchingItem) {
                // SOMMA la quantità riservata esistente con la nuova quantità
                const newQuantityReserved = itemDetail.getQuantityReserved() + matchingItem.getQuantity();
                return new OrderItemDetail(
                    itemDetail.getItem(),
                    newQuantityReserved,
                    itemDetail.getUnitPrice()
                );
            }
            
            // Se non trova corrispondenza, mantiene l'item originale
            return itemDetail;
        });
        
        // Aggiorna le quantità riservate nel repository
        await this.ordersRepositoryMongo.updateReservedStock(orderId, updatedItems);
        
        // Verifica se tutta la merce è stata riservata
        if (order instanceof SellOrder) {
            await this.checkReservedQuantityForSellOrder(order);
        } else if (order instanceof InternalOrder) {
            await this.checkReservedQuantityForInternalOrder(order);
        }
    }


    async checkReservedQuantityForSellOrder(sellOrder: SellOrder): Promise<void> {
        const idStr = sellOrder.getOrderId();
        const idDomain = new OrderId(idStr);
        try {
            // Usa il repository per verificare le quantità riservate
            await this.ordersRepositoryMongo.checkReservedQuantityForSellOrder(sellOrder);
            
            // Se arriva qui senza eccezioni, significa che è tutto riservato
            // Estrai gli item dagli OrderItemDetail
            const items = sellOrder.getItemsDetail().map(itemDetail => 
                itemDetail.getItem()
            );

            // Tutta la merce è riservata, procedi con la spedizione
            await this.outboundEventAdapter.publishShipment(idDomain, items);
        } catch (error) {
            // Se c'è errore, avvia riassortimento
            /* TODO: Cosa chiamare per avviare riassortimento?*/
        }
    }


    async checkReservedQuantityForInternalOrder(internalOrder: InternalOrder): Promise<void> {
        const idStr = internalOrder.getOrderId();
        const idDomain = new OrderId(idStr);
        try {
            // Usa il repository per verificare le quantità riservate
            await this.ordersRepositoryMongo.checkReservedQuantityForInternalOrder(internalOrder);
            
            // Se arriva qui senza eccezioni, significa che è tutto riservato
            // Estrai gli item dagli OrderItemDetail
            const items = internalOrder.getItemsDetail().map(itemDetail => 
                itemDetail.getItem()
            );

            // Tutta la merce è riservata, procedi con la spedizione
            await this.outboundEventAdapter.publishShipment(idDomain, items);
        } catch (error) {
            // Se c'è errore, avvia riassortimento
            /* TODO: Cosa chiamare per avviare riassortimento?*/
        }
    }


    async shipOrder(id: OrderId): Promise<void> {
        // Aggiorna stato a SHIPPED
        await this.ordersRepositoryMongo.updateOrderState(id, OrderState.SHIPPED);
        
        // Comunica a Inventario di spedire la merce
        const order = await this.ordersRepositoryMongo.getById(id);
        const items = order.getItemsDetail().map(itemDetail => 
            itemDetail.getItem()
        );
            
        await this.outboundEventAdapter.publishShipment(id, items);
        
        console.log(`Ordine ${id.getId()} spedito!`);
    }        
    
    async receiveOrder(id: OrderId): Promise<void> {
        // Per ordini in arrivo (destinazione)
        const order = await this.ordersRepositoryMongo.getById(id);
        
        if (order instanceof InternalOrder) {
            // Aggiorna stato a COMPLETED
            await this.ordersRepositoryMongo.updateOrderState(id, OrderState.COMPLETED);
            
            // Estrai gli OrderItem dagli OrderItemDetail
            const items = order.getItemsDetail().map(itemDetail => 
                itemDetail.getItem()
            );
            
            // Aggiungi la merce all'inventario locale usando receiveShipment
            await this.outboundEventAdapter.receiveShipment(
                id, 
                items, 
                order.getWarehouseDestination() // o il warehouse corrente?
            );
                       
            // Notifica completamento all'aggregato (che poi potrebbe notificare il magazzino sorgente)
            await this.outboundEventAdapter.orderCompleted(id);        
        }
    }

    async completeOrder(id: OrderId): Promise<void> {
        await this.updateOrderState(id, OrderState.COMPLETED);
        console.log(`L'ordine interno di rifornimento ${id} è stato completato!`, JSON.stringify(id, null, 2));

        await this.outboundEventAdapter.orderCompleted(id);
    }

}