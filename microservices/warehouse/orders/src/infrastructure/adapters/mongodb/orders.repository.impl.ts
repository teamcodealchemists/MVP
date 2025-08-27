import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { DataMapper } from "src/application/data.mapper";
import { InternalOrderModel } from "./model/internalOrder.model";
import { SellOrderModel } from "./model/sellOrder.model";
import { OrderItemDetailModel } from "./model/orderItemDetail.model";

import { OrdersRepository } from "src/domain/orders.repository";
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { ItemId } from "src/domain/itemId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

@Injectable()
export class OrdersRepositoryMongo implements OrdersRepository {
  constructor(
    @InjectModel("InternalOrder") private readonly internalOrderModel: InternalOrderModel,
    @InjectModel("SellOrder") private readonly sellOrderModel: SellOrderModel,
    @InjectModel("OrderItemDetail") private readonly orderItemDetailModel: OrderItemDetailModel,
    @Inject(DataMapper)
    private readonly mapper: DataMapper
  ) {}
  
    async getById(id: OrderId): Promise<InternalOrder | SellOrder> {
        try {
            // Cerca un InternalOrder con quell'ID
            const internalDoc = await this.internalOrderModel.findOne(
                { "orderId.id": id.getId() }).lean().exec() as any;
            if (internalDoc) {
                return new InternalOrder(
                        new OrderId(internalDoc.orderId.id),
                        internalDoc.items.map(item => 
                            new OrderItemDetail(
                                    new OrderItem(
                                        new ItemId(item.item.id),
                                        item.item.quantity), 
                                item.quantityReserved,
                                item.unitPrice
                            )
                        ),
                        internalDoc.orderState as OrderState, 
                        new Date(internalDoc.creationDate),
                        internalDoc.warehouseDeparture,
                        internalDoc.warehouseDestination
                );
            }

            // Cerca un SellOrder con quell'id
            const sellDoc = await this.sellOrderModel.findOne(
                { "orderId.id": id.getId() }).lean().exec() as any;
            console.log("sellDoc generato", sellDoc);
            if (sellDoc) {
                console.log("sellDoc esistente:", sellDoc);
                return new SellOrder(
                    new OrderId(sellDoc.orderId.id),
                    sellDoc.items.map(item => 
                        new OrderItemDetail(
                                new OrderItem(
                                    new ItemId(item.item.id),
                                    item.item.quantity), 
                            item.quantityReserved,
                            item.unitPrice
                        )
                    ),
                    sellDoc.orderState as OrderState, 
                    new Date(sellDoc.creationDate),
                    sellDoc.warehouseDeparture,
                    sellDoc.destinationAddress
                );
            }
            // Fallback        
            throw new Error(`Ordine con ID ${id.getId()} non trovato`);
        } catch (error) {
            console.error("Errore durante la ricerca dell'ordine per ID:", error);
            throw error;
        }
    }

    async getState(id: OrderId): Promise<OrderState> {
        try {        
            const internalDoc = await this.internalOrderModel.findOne({ "orderId.id": id.getId() }, { orderState: 1 }).lean().exec();
            if (internalDoc) {
            return internalDoc.orderState as OrderState;
            }

            const sellDoc = await this.sellOrderModel.findOne({ "orderId.id": id.getId() }, { orderState: 1 }).lean().exec();
            if (sellDoc) {
            return sellDoc.orderState as OrderState;
            }

            throw new Error(`Stato per l'ordine ${id.getId()} non trovato`);
        } catch (error) {
            console.error("Errore durante la ricerca dello stato dell'ordine:", error);
            throw error;
        }
    }

    async getAllOrders(): Promise<Orders> {
        try {
            const internalDocs = await this.internalOrderModel.find().lean().exec();
            const sellDocs = await this.sellOrderModel.find().lean().exec();

            const internalOrders = await Promise.all(internalDocs.map(doc => this.mapper.internalOrderToDomain(doc as any)));
            const sellOrders = await Promise.all(sellDocs.map(doc => this.mapper.sellOrderToDomain(doc as any)));

            return new Orders(sellOrders, internalOrders);
        } catch (error) {
            console.error("Errore durante il recupero di tutti gli ordini:", error);
            throw error;
        }
    }

    // TODO: Per sia S che I, approfondire il fatto "genUniqueId"
    async addSellOrder(order: SellOrder): Promise<void> {
        try {
            // Verifica se l'ordine esiste già
            const existingOrder = await this.sellOrderModel.findOne({
                "orderId.id": this.genUniqueId('S')
            }).exec();

            if (existingOrder) {
                console.log(`L'Ordine con ID ${order.getOrderId()} è già esistente. L'Id verrà rigenerato.`);
                
                // Rigenera ID e clona l'ordine con nuovo ID
                const newOrderId = await this.genUniqueId('S');
                const newOrder = new SellOrder(
                    newOrderId,
                    order.getItemsDetail(),
                    order.getOrderState(),
                    order.getCreationDate(),
                    order.getWarehouseDeparture(),
                    order.getDestinationAddress()
                );
                
                // Richiama ricorsivamente con il nuovo ordine
                return await this.addSellOrder(newOrder);
            }

            // Se non esiste, procedi con il salvataggio
            const orderData = {
                orderId: {
                    id: order.getOrderId()
                },
                items: order.getItemsDetail().map(item => ({
                    item: {
                        id: item.getItem().getItemId()
                    },
                    quantity: item.getItem().getQuantity(),
                    quantityReserved: item.getQuantityReserved(),
                    unitPrice: item.getUnitPrice()
                })),
                orderState: order.getOrderState(),
                creationDate: order.getCreationDate(),
                warehouseDeparture: order.getWarehouseDeparture(),
                destinationAddress: order.getDestinationAddress()
            };

            const createdOrder = new this.sellOrderModel(orderData);
            await createdOrder.save();
            
            console.log('Aggiunto con successo l\'ordine con ID:', order.getOrderId());
            
        } catch (error) {
            console.error("Errore durante l'aggiunta del SellOrder:", error);
            throw error;
        }
    }

    async addInternalOrder(order: InternalOrder): Promise<void> {
        try {
            // Verifica se esiste già un ordine con lo stesso ID
            const existingOrder = await this.internalOrderModel.findOne({
                "orderId.id": this.genUniqueId('I')
            }).exec();

            if (existingOrder) {
                console.log(`L'Ordine con ID ${order.getOrderId()} è già esistente. L'Id verrà rigenerato.`);
                
                // Rigenera ID e clona l'ordine con il nuovo ID
                const newOrderId = await this.genUniqueId('I');
                const newOrder = new InternalOrder(
                    newOrderId,
                    order.getItemsDetail(),
                    order.getOrderState(),
                    order.getCreationDate(),
                    order.getWarehouseDeparture(),
                    order.getWarehouseDestination()
                );
                
                // Richiama ricorsivamente con il nuovo ordine
                return await this.addInternalOrder(newOrder);
            }

            // Se l'ID generato è unico, procedi con il salvataggio
            const orderData = {
                orderId: {
                    id: order.getOrderId()
                },
                items: order.getItemsDetail().map(item => ({
                    item: {
                        id: item.getItem().getItemId()
                    },
                    quantity: item.getItem().getQuantity(),
                    quantityReserved: item.getQuantityReserved(),
                    unitPrice: item.getUnitPrice()
                })),
                orderState: order.getOrderState(),
                creationDate: order.getCreationDate(),
                warehouseDeparture: order.getWarehouseDeparture(),
                warehouseDestination: order.getWarehouseDestination()
            };

            const createdOrder = new this.internalOrderModel(orderData);
            await createdOrder.save();
            
            console.log('Aggiunto con successo l\'ordine con ID:', order.getOrderId());
            
        } catch (error) {
            console.error("Errore durante l'aggiunta dell'InternalOrder:", error);
            throw error;
        }
    }

    async removeById(id: OrderId): Promise<boolean> {
      /* Rimozione
        try {
            const resInternal = await this.internalOrderModel.deleteOne({ "orderId.id": id.getId() }).exec();
            if (resInternal.deletedCount > 0) return true;

            const resSell = await this.sellOrderModel.deleteOne({ "orderId.id": id.getId() }).exec();
            return resSell.deletedCount > 0;
        } catch (error) {
            console.error("Errore durante la rimozione dell'ordine:", error);
            throw error;
        } 
            
        Cancellazione */
        const currentState = await this.getState(id);

        if (currentState === OrderState.CANCELED) {
            return false; // E' gia in stato "CANCELED"
        }

        const updatedOrder = await this.updateOrderState(id, OrderState.CANCELED);

        // Se l'ordine è stato aggiornato correttamente, restituisci true
        return updatedOrder.getOrderState() === OrderState.CANCELED;

    }

    async updateOrderState(id: OrderId, state: OrderState): Promise<InternalOrder | SellOrder> {
        try {
            // Cerca un InternalOrder con quell'Id. Se c'è, aggiorna Mongo e returna l'ordine in forma domain.
            const internalDoc = await this.internalOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { orderState: state },
                { new: true }
            ).lean().exec() as any;

            if (internalDoc) {
            return new InternalOrder(
                    new OrderId(internalDoc.orderId.id),
                    internalDoc.items.map(item => 
                        new OrderItemDetail(
                                new OrderItem(
                                    new ItemId(item.item.id),
                                    item.item.quantity), 
                            item.quantityReserved,
                            item.unitPrice
                        )
                    ),
                    internalDoc.orderState as OrderState, 
                    new Date(internalDoc.creationDate),
                    internalDoc.warehouseDeparture,
                    internalDoc.warehouseDestination
                );
            }                    
            // Cerca un SellOrder con quell'Id. Se c'è, aggiorna Mongo e returna l'ordine in forma domain.
            const sellDoc = await this.sellOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { orderState: state },
                { new: true }
            ).lean().exec() as any;
        
            if (sellDoc) {
                return new SellOrder(
                    new OrderId(sellDoc.orderId.id),
                    sellDoc.items.map(item => 
                        new OrderItemDetail(
                                new OrderItem(
                                    new ItemId(item.item.id),
                                    item.item.quantity), 
                            item.quantityReserved,
                            item.unitPrice
                        )
                    ),
                    sellDoc.orderState as OrderState, 
                    new Date(sellDoc.creationDate),
                    sellDoc.warehouseDeparture,
                    sellDoc.destinationAddress
                );
            }
            // Fallback
            throw new Error(`Impossibile aggiornare lo stato: ordine con ID ${id.getId()} non trovato`);
        } catch (error) {
            console.error("Errore durante l'aggiornamento dello stato dell'ordine:", error);
            throw error;
        }
    }

    async genUniqueId(orderType: 'S' | 'I'): Promise<OrderId> {
        try {
            const randomNumber = Math.floor(1000 + Math.random() * 9000); // 1000-9999
            const uniqueId = `${orderType}${randomNumber}`;
            
            return new OrderId(uniqueId);
        } catch (error) {
            console.error("Errore durante la generazione dell'ID univoco:", error);
            throw error;
        }
    }

    async updateReservedStock(id: OrderId, items: OrderItem[]): Promise<InternalOrder | SellOrder> {
        try {
            const updateItems = items.map(i => ({
                item: { itemId: { id: i.getItemId() }, quantity: i.getQuantity() },
                quantityReserved: i.getQuantity(), 
                unitPrice: 0 
            }));

            const internalDoc = await this.internalOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { $set: { items: updateItems } },
                { new: true }
            ).lean().exec();
            if (internalDoc) return await this.mapper.internalOrderToDomain(internalDoc as any);

            const sellDoc = await this.sellOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { $set: { items: updateItems } },
                { new: true }
            ).lean().exec();
            if (sellDoc) return await this.mapper.sellOrderToDomain(sellDoc as any);

            throw new Error(`Impossibile aggiornare la riserva: ordine con ID ${id.getId()} non trovato`);
        } catch (error) {
        console.error("Errore durante l'aggiornamento della quantità riservata:", error);
        throw error;
        }
    }

    async checkReservedQuantityForSellOrder(sellOrder: SellOrder): Promise<void> {
        try {
            const stringId = sellOrder.getOrderId();
            const orderId = new OrderId(stringId);
            const order = await this.getById(orderId);

            if (!order || !(order instanceof SellOrder)) {
            throw new NotFoundException('SellOrder non trovato');
            }

            const items = order.getItemsDetail();
            items.forEach((itemDetail: OrderItemDetail) => {
            const reservedQty = itemDetail.getQuantityReserved();
            console.log(`Item: ${itemDetail.getItem().getItemId()}, Reserved: ${reservedQty}`);
            // Eventuale logica di validazione
            });
        } catch (error) {
            console.error(`Errore in checkReservedQuantityForSellOrder: ${error.message}`);
            throw error; 
        }    
    }

    async checkReservedQuantityForInternalOrder(internalOrder: InternalOrder): Promise<void>{
        try {
            const stringId = internalOrder.getOrderId();
            const orderId = new OrderId(stringId);
            const order = await this.getById(orderId);

            if (!order || !(order instanceof InternalOrder)) {
            throw new NotFoundException('InternalOrder non trovato');
            }

            const items = order.getItemsDetail();
            items.forEach((itemDetail: OrderItemDetail) => {
            const reservedQty = itemDetail.getQuantityReserved();
            console.log(`Item: ${itemDetail.getItem().getItemId()}, Reserved: ${reservedQty}`);
            // Eventuale logica di validazione
            });
        } catch (error) {
            console.error(`Errore in checkReservedQuantityForInternalOrder: ${error.message}`);
            throw error;
        }
    }

}
