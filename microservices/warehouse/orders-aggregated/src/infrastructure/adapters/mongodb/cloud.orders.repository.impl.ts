import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { CloudDataMapper } from "src/infrastructure/mappers/cloud.data.mapper";
import { SyncInternalOrderModel } from "./model/syncInternalOrder.model";
import { SyncSellOrderModel } from "./model/syncSellOrder.model";
import { SyncOrderItemDetailModel } from "./model/syncOrderItemDetail.model";

import { CloudOrdersRepository } from "src/domain/cloud.orders.repository";
import { SyncOrders } from "src/domain/syncOrders.entity";
import { SyncOrderItem } from "src/domain/syncOrderItem.entity";
import { SyncOrderItemDetail } from "src/domain/syncOrderItemDetail.entity";
import { SyncOrderState } from "src/domain/syncOrderState.enum";

import { SyncOrderId } from "src/domain/syncOrderId.entity";
import { SyncItemId } from "src/domain/syncItemId.entity";
import { SyncInternalOrder } from "src/domain/syncInternalOrder.entity";
import { SyncSellOrder } from "src/domain/syncSellOrder.entity";

@Injectable()
export class CloudOrdersRepositoryMongo implements CloudOrdersRepository {
  constructor(
    @InjectModel("InternalOrder") private readonly syncInternalOrderModel: SyncInternalOrderModel,
    @InjectModel("SellOrder") private readonly syncSellOrderModel: SyncSellOrderModel,
    @InjectModel("OrderItemDetail") private readonly syncOrderItemDetailModel: SyncOrderItemDetailModel,
    @Inject(CloudDataMapper)
    private readonly mapper: CloudDataMapper
  ) {}
  
    
    async getById(id: SyncOrderId): Promise<SyncInternalOrder | SyncSellOrder> {
        try {
            // Cerca un InternalOrder con quell'ID
            const internalDoc = await this.syncInternalOrderModel.findOne(
                { "orderId.id": id.getId() }).lean().exec() as any;
            if (internalDoc) {
                // Ritorna l'oggetto ordine convertito da Document a Domain
                return new SyncInternalOrder(
                        new SyncOrderId(internalDoc.orderId.id),
                        internalDoc.items.map(item => 
                            new SyncOrderItemDetail(
                                    new SyncOrderItem(
                                        new SyncItemId(item.item.itemId),
                                        item.item.quantity), 
                                item.quantityReserved,
                                item.unitPrice
                            )
                        ),
                        internalDoc.orderState as SyncOrderState, 
                        new Date(internalDoc.creationDate),
                        internalDoc.warehouseDeparture,
                        internalDoc.warehouseDestination
                );
            }

            // Cerca un SellOrder con quell'id
            const sellDoc = await this.syncSellOrderModel.findOne(
                { "orderId.id": id.getId() }).lean().exec() as any;
            console.log("sellDoc generato", sellDoc);
            if (sellDoc) {
                // Ritorna l'oggetto ordine convertito da Document a Domain
                return new SyncSellOrder(
                    new SyncOrderId(sellDoc.orderId.id),
                    sellDoc.items.map(item => 
                        new SyncOrderItemDetail(
                                new SyncOrderItem(
                                    new SyncItemId(item.item.itemId),
                                    item.item.quantity), 
                            item.quantityReserved,
                            item.unitPrice
                        )
                    ),
                    sellDoc.orderState as SyncOrderState, 
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

    async getState(id: SyncOrderId): Promise<SyncOrderState> {
        try {        
            const internalDoc = await this.syncInternalOrderModel.findOne({ "orderId.id": id.getId() }, { orderState: 1 }).lean().exec();
            if (internalDoc) {
            return internalDoc.orderState as SyncOrderState;
            }

            const sellDoc = await this.syncSellOrderModel.findOne({ "orderId.id": id.getId() }, { orderState: 1 }).lean().exec();
            if (sellDoc) {
            return sellDoc.orderState as SyncOrderState;
            }

            throw new Error(`Stato per l'ordine ${id.getId()} non trovato`);
        } catch (error) {
            console.error("Errore durante la ricerca dello stato dell'ordine:", error);
            throw error;
        }
    }

    async getAllOrders(): Promise<SyncOrders> {
        try {
            const internalDocs = await this.syncInternalOrderModel.find().lean().exec() as any[];
            const sellDocs = await this.syncSellOrderModel.find().lean().exec() as any[];

        // Conversione da documento a dominio
            const internalOrders = internalDocs.map(doc => {
                try {
                    return new SyncInternalOrder(
                        new SyncOrderId(doc.orderId.id),
                        (doc.items || []).map(item => 
                            new SyncOrderItemDetail(
                                new SyncOrderItem(
                                    new SyncItemId(item.item.itemId),
                                    item.item.quantity
                                ), 
                                item.quantityReserved,
                                item.unitPrice
                            )
                        ),
                        doc.orderState as SyncOrderState,
                        new Date(doc.creationDate),
                        doc.warehouseDeparture,
                        doc.warehouseDestination
                    );
                } catch (error) {
                    throw new Error('Errore conversione internalDoc:', error);
                }
            });

        // Conversione da documento a dominio
            const sellOrders = sellDocs.map(doc => {
                try {
                    return new SyncSellOrder(
                        new SyncOrderId(doc.orderId.id),
                        (doc.items || []).map(item => 
                            new SyncOrderItemDetail(
                                new SyncOrderItem(
                                    new SyncItemId(item.item.itemId),
                                    item.item.quantity
                                ), 
                                item.quantityReserved,
                                item.unitPrice
                            )
                        ),
                        doc.orderState as SyncOrderState,
                        new Date(doc.creationDate),
                        doc.warehouseDeparture,
                        doc.destinationAddress
                    );
                } catch (error) {
                    throw new Error('Errore conversione sellDoc:', error);
                }
            });

            return new SyncOrders(sellOrders, internalOrders);
            
        } catch (error) {
            throw new Error ("Errore durante il recupero di tutti gli ordini:", error);
        }
    }

    async syncAddSellOrder(order: SyncSellOrder): Promise<void> {
        try {           
            // Crea il nuovo ordine
            const newOrder = new SyncSellOrder(
                new SyncOrderId(order.getOrderId()),
                order.getItemsDetail(),
                order.getOrderState(),
                order.getCreationDate(),
                order.getWarehouseDeparture(),
                order.getDestinationAddress()
            );

            // Salva l'ordine
            const orderData = {
                orderId: {
                    id: newOrder.getOrderId()
                },
                items: newOrder.getItemsDetail().map(item => ({
                    item: {
                        id: item.getItem().getItemId()
                    },
                    quantity: item.getItem().getQuantity(),
                    quantityReserved: item.getQuantityReserved(),
                    unitPrice: item.getUnitPrice()
                })),
                orderState: newOrder.getOrderState(),
                creationDate: newOrder.getCreationDate(),
                warehouseDeparture: newOrder.getWarehouseDeparture(),
                destinationAddress: newOrder.getDestinationAddress()
            };

            const createdOrder = new this.syncSellOrderModel(orderData);
            await createdOrder.save();
            
            console.log('Aggiunto con successo il SellOrder con ID:', newOrder.getOrderId());
            
        } catch (error) {
            console.error("Errore durante l'aggiunta del SellOrder:", error);
            throw error;
        }
    }

    async syncAddInternalOrder(order: SyncInternalOrder): Promise<void> {
        try {
            // Crea il nuovo ordine 
            const newOrder = new SyncInternalOrder(
                new SyncOrderId(order.getOrderId()),
                order.getItemsDetail(),
                order.getOrderState(),
                order.getCreationDate(),
                order.getWarehouseDeparture(),
                order.getWarehouseDestination()
            );

            // Salva l'ordine
            const orderData = {
                orderId: {
                    id: newOrder.getOrderId()
                },
                items: newOrder.getItemsDetail().map(item => ({
                    item: {
                        id: item.getItem().getItemId()
                    },
                    quantity: item.getItem().getQuantity(),
                    quantityReserved: item.getQuantityReserved(),
                    unitPrice: item.getUnitPrice()
                })),
                orderState: newOrder.getOrderState(),
                creationDate: newOrder.getCreationDate(),
                warehouseDeparture: newOrder.getWarehouseDeparture(),
                warehouseDestination: newOrder.getWarehouseDestination()
            };

            const createdOrder = new this.syncInternalOrderModel(orderData);
            await createdOrder.save();
            
            console.log('Aggiunto con successo l\'InternalOrder con ID:', newOrder.getOrderId());
            
        } catch (error) {
            console.error("Errore durante l'aggiunta dell'InternalOrder:", error);
            throw error;
        }
    }

    async syncRemoveById(id: SyncOrderId): Promise<boolean> {
        // Per cancellazione ordine
        const currentState = await this.getState(id);

        if (currentState === SyncOrderState.CANCELED) {
            return false; // E' gia in stato "CANCELED", non verrà aggiornato
        }

        const updatedOrder = await this.syncUpdateOrderState(id, SyncOrderState.CANCELED);

        // Se l'ordine è stato aggiornato correttamente, restituisci true
        return updatedOrder.getOrderState() === SyncOrderState.CANCELED;

    }


    async syncUpdateOrderState(id: SyncOrderId, state: SyncOrderState): Promise<SyncInternalOrder | SyncSellOrder> {
        try {
            // Cerca un InternalOrder con quell'Id. Se c'è, aggiorna Mongo e returna l'ordine in forma domain.
            const internalDoc = await this.syncInternalOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { orderState: state },
                { new: true }
            ).lean().exec() as any;

            if (internalDoc) {
            return new SyncInternalOrder(
                    new SyncOrderId(internalDoc.orderId.id),
                    internalDoc.items.map(item => 
                        new SyncOrderItemDetail(
                                new SyncOrderItem(
                                    new SyncItemId(item.item.itemId),
                                    item.item.quantity), 
                            item.quantityReserved,
                            item.unitPrice
                        )
                    ),
                    internalDoc.orderState as SyncOrderState, 
                    new Date(internalDoc.creationDate),
                    internalDoc.warehouseDeparture,
                    internalDoc.warehouseDestination
                );
            }                    
            // Cerca un SellOrder con quell'Id. Se c'è, aggiorna Mongo e returna l'ordine in forma domain.
            const sellDoc = await this.syncSellOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { orderState: state },
                { new: true }
            ).lean().exec() as any;
        
            if (sellDoc) {
                return new SyncSellOrder(
                    new SyncOrderId(sellDoc.orderId.id),
                    sellDoc.items.map(item => 
                        new SyncOrderItemDetail(
                                new SyncOrderItem(
                                    new SyncItemId(item.item.itemId),
                                    item.item.quantity), 
                            item.quantityReserved,
                            item.unitPrice
                        )
                    ),
                    sellDoc.orderState as SyncOrderState, 
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
 

    async syncUpdateReservedStock(id: SyncOrderId, items: SyncOrderItem[]): Promise<SyncInternalOrder | SyncSellOrder> {
        try {
            // Trova tipo di ordine e documento
            const internalDoc = await this.syncInternalOrderModel.findOne({ 
                "orderId.id": id.getId() 
            }).lean().exec() as any;

            let model: any;
            let mapper: (doc: any) => Promise<SyncInternalOrder | SyncSellOrder>;
        
            if (internalDoc) {
                model = this.syncInternalOrderModel;
                mapper = async (doc) => {
                    const orderIdDTO = doc.orderId;
                    const internalOrderDTO = {
                        items: doc.items,
                        orderState: doc.orderState,
                        creationDate: doc.creationDate,
                        warehouseDeparture: doc.warehouseDeparture,
                        warehouseDestination: doc.warehouseDestination
                    };
                    return this.mapper.syncInternalOrderToDomain(orderIdDTO, internalOrderDTO);
                };
            } else {
                model = this.syncSellOrderModel;
                mapper = async (doc) => {
                    const orderIdDTO = doc.orderId;
                    const sellOrderDTO = {
                        items: doc.items,
                        orderState: doc.orderState,
                        creationDate: doc.creationDate,
                        warehouseDeparture: doc.warehouseDeparture,
                        destinationAddress: doc.destinationAddress
                    };
                    return this.mapper.syncSellOrderToDomain(orderIdDTO, sellOrderDTO);
                };
            }

            // Prepara e esegui gli aggiornamenti
            const updateOperations = items.map(item => ({
                updateOne: {
                    filter: { 
                        "orderId.id": id.getId(),
                        "items.item.itemId.id": item.getItemId()
                    },
                    update: {
                        $set: { 
                            "items.$.quantityReserved": item.getQuantity()
                        }
                    }
                }
            }));

            if (updateOperations.length > 0) {
                await model.bulkWrite(updateOperations);
            }
            
            // Recupera il documento aggiornato
            const updatedDoc = await model.findOne({ 
                "orderId.id": id.getId() 
            }).lean().exec();
            
            if (!updatedDoc) {
                throw new Error(`Ordine con ID ${id.getId()} non trovato dopo l'aggiornamento`);
            }
            
            // Converti a dominio e restituisci il documento aggiornato
            return await mapper(updatedDoc as any);
            
        } catch (error) {
            console.error("Errore durante l'aggiornamento della quantità riservata:", error);
            throw new Error(`Impossibile trovare l'ordine con ID ${id.getId()}`);
        }
    }
}