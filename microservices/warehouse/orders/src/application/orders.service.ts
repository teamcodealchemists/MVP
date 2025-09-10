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
    ) { }


    async checkOrderExistence(id: OrderId): Promise<boolean> {
        const order = await this.ordersRepositoryMongo.getById(id);
        if (!order) {
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

        Logger.log(`Ordine ${id.getId()} - Tutta la merce è disponibile e riservata`);

        // Procedi con il flusso normale
        if (order instanceof SellOrder) {
            await this.checkReservedQuantityForSellOrder(order);
        } else if (order instanceof InternalOrder) {
            await this.checkReservedQuantityForInternalOrder(order);
        }
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

        Logger.debug(
            `Order ID: ${id.getId()} | Current state: ${currentState} | New state: ${newState} | `,
            'OrdersService'
        );

        // Controlla la validità della transizione di stato
        // Se è in uno degli Stati finali: non può cambiare
        if (currentState === OrderState.COMPLETED || currentState === OrderState.CANCELED) {
            throw new Error('Impossibile violare il corretto flusso di gestione stato dell\'ordine: stato finale raggiunto');
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
            throw new Error('Impossibile violare il corretto flusso di gestione stato dell\'ordine');
        }

        // Aggiorna lo stato nella repository
        await this.ordersRepositoryMongo.updateOrderState(id, newState);

        // Cerca l'ordine per poter prelevare il warehouseDeparture
        let order = await this.ordersRepositoryMongo.getById(id);

        // Se lo stato dell'ordine è cambiato e ci troviamo nel magazzino Mittente allora aggiorna l'aggregato
        if (process.env.WAREHOUSE_ID == order.getWarehouseDeparture().toString()) {
            return await this.outboundEventAdapter.orderStateUpdated(id, newState, {
                destination: 'aggregate'
            });
        }
    }

    async checkOrderState(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.getState(id);
    }


    async createSellOrder(order: SellOrder): Promise<string> {
        let uniqueOrderId: OrderId;

        // Se l'ID è vuoto, genera nuovo ID, altrimenti usa quello esistente
        if (!order.getOrderId() || order.getOrderId() === '') {
            const newId = await this.ordersRepositoryMongo.genUniqueId('S');
            uniqueOrderId = new OrderId(newId.getId());
        } else {
            uniqueOrderId = new OrderId(order.getOrderId());
        }
        console.log("Creating sell order:", order);

        // Crea il nuovo ordine di vendita
        const orderWithUniqueId = new SellOrder(
            uniqueOrderId,
            order.getItemsDetail(),
            order.getOrderState(),
            order.getCreationDate(),
            order.getWarehouseDeparture(),
            order.getDestinationAddress()
        );

        // Aggiungi il nuovo ordine alla repo e pubblica l'evento di aggiunta del nuovo ordine anche nell'aggregate
        await this.ordersRepositoryMongo.addSellOrder(orderWithUniqueId);
        await this.orderSaga.startSellOrderSaga(uniqueOrderId);
        await this.outboundEventAdapter.publishSellOrder(orderWithUniqueId, { destination: 'aggregate' });

        return Promise.resolve(uniqueOrderId.getId());
    }

    async createInternalOrder(order: InternalOrder): Promise<string> {
        let uniqueOrderId: OrderId;

        // Se l'ID è vuoto, genera nuovo ID, altrimenti usa quello esistente
        if (!order.getOrderId() || order.getOrderId() === '') {
            const newId = await this.ordersRepositoryMongo.genUniqueId('I');
            uniqueOrderId = new OrderId(newId.getId());
        } else {
            uniqueOrderId = new OrderId(order.getOrderId());
        }

        Logger.debug(`Creating internal order with ID: ${uniqueOrderId.getId()}`, 'OrdersService');

        // Crea il nuovo ordine interno
        const orderWithUniqueId = new InternalOrder(
            uniqueOrderId,
            order.getItemsDetail(),
            order.getOrderState(),
            order.getCreationDate(),
            order.getWarehouseDeparture(),
            order.getWarehouseDestination(),
            order.getSellOrderReference()
        );

        // Aggiungi il nuovo ordine alla repo
        await this.ordersRepositoryMongo.addInternalOrder(orderWithUniqueId);

        // Controlla se il warehouse di partenza è quello corrente
        const currentWarehouseId = process.env.WAREHOUSE_ID; //Chi siamo noi

        if (order.getWarehouseDeparture().toString() === currentWarehouseId) {
            // Se il warehouse di partenza è quello corrente:
            //  => avvia l'InternalOrderSaga, pubblica all'aggregate Orders e pubblica al warehouse di destinazione

            await this.outboundEventAdapter.publishInternalOrder(orderWithUniqueId, {
                destination: 'aggregate'
            });


            await this.orderSaga.startInternalOrderSaga(uniqueOrderId);
            await this.updateOrderState(uniqueOrderId, OrderState.PROCESSING);

            Logger.debug(`Order published to aggregate and warehouse ${order.getWarehouseDestination()}`, 'OrdersService');
        } else {
            // Se il warehouse corrente NON è quello di partenza, fai solo il salvataggio nella repo nel magazzino di destinazione
            // => (E' per evitare di evitare dati duplicati all'aggregate Orders)
            this.outboundEventAdapter.waitingForStock(uniqueOrderId, order.getWarehouseDeparture().toString());
            Logger.debug(`Order created but not published (current warehouse: ${currentWarehouseId})`, 'OrdersService');
        }

        return Promise.resolve(uniqueOrderId.getId());
    }


    async cancelOrder(id: OrderId): Promise<void> {
        await this.updateOrderState(id, OrderState.CANCELED);
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
            console.log(`Sto per fare la spedizione dell'ordine SellOrder con id: ${idStr}`);
            await this.outboundEventAdapter.publishShipment(idDomain, items);
        } catch (error) {
            // Se c'è errore, avvia riassortimento
            console.log(`Sto per fare riassorimento dell'ordine SellOrder con id: ${idStr}`);
            const items = sellOrder.getItemsDetail().map(itemDetail =>
                itemDetail.getItem()
            );
            await this.outboundEventAdapter.publishStockRepl(idDomain, items);
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
            //await this.outboundEventAdapter.publishShipment(idDomain, items);
            await this.outboundEventAdapter.publishInternalOrder(internalOrder, { destination: 'warehouse', warehouseId: internalOrder.getWarehouseDestination() });
        } catch (error) {
            await this.cancelOrder(idDomain);
            Logger.warn(`Ordine interno ${idStr} annullato a causa di merce non disponibile.`);
        }
    }


    async shipOrder(id: OrderId): Promise<void> {
        const order = await this.ordersRepositoryMongo.getById(id);

        // Aggiorna stato a SHIPPED
        await this.ordersRepositoryMongo.updateOrderState(id, OrderState.SHIPPED);
        if (order instanceof InternalOrder) {
            await this.outboundEventAdapter.orderStateUpdated(id, OrderState.SHIPPED, { destination: 'warehouse', warehouseId: order.getWarehouseDestination() });
        }
        // Comunica a Inventario di spedire la merce
        const items = order.getItemsDetail().map(itemDetail =>
            itemDetail.getItem()
        );

        await this.outboundEventAdapter.publishShipment(id, items);

        console.log(`Ordine ${id.getId()} spedito!`);
    }

    async receiveOrder(orderIdDomain: OrderId) {
        const order = await this.ordersRepositoryMongo.getById(orderIdDomain);

        if (order instanceof InternalOrder) {
            await this.outboundEventAdapter.receiveShipment(
                orderIdDomain,
                order.getItemsDetail().map(itemDetail => itemDetail.getItem()),
                order.getWarehouseDestination()
            );
        }
    }

    /*async receiveOrder(id: OrderId): Promise<void> {
        // Per ordini in arrivo (destinazione)
        const order = await this.ordersRepositoryMongo.getById(id);

        if (order instanceof InternalOrder) {

            // Aggiorna stato a COMPLETED
            await this.updateOrderState(id, OrderState.COMPLETED);

            //Notifica il magazzino di partenza che l'ordine è completato ed è arrivato a destinazione
            this.outboundEventAdapter.completeSagaOrdertoDestination(id, order.getWarehouseDestination().toString());

            return Promise.resolve();
        }
    }*/

    async completeOrder(id: OrderId): Promise<void> {
        await this.updateOrderState(id, OrderState.COMPLETED);

        const order = await this.ordersRepositoryMongo.getById(id);
        if (order instanceof InternalOrder && process.env.WAREHOUSE_ID == order.getWarehouseDestination().toString()) {
            //Notifica il magazzino di partenza che l'ordine è completato ed è arrivato a destinazione
            this.outboundEventAdapter.orderCompleted(id, order.getWarehouseDeparture());
        }
        else {
            Logger.log(`✅ L'ordine interno di rifornimento ${id} è stato completato! YIPPIE!`, JSON.stringify(id, null, 2));
        }
    }

}