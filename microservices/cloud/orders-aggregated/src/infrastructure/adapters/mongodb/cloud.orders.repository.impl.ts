import { Injectable, Inject, NotFoundException, Logger } from "@nestjs/common";
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

  private readonly logger = new Logger(CloudOrdersRepositoryMongo.name);

  constructor(
    @InjectModel("SyncInternalOrder") private readonly syncInternalOrderModel: SyncInternalOrderModel,
    @InjectModel("SyncSellOrder") private readonly syncSellOrderModel: SyncSellOrderModel,
    @InjectModel("SyncOrderItemDetail") private readonly syncOrderItemDetailModel: SyncOrderItemDetailModel,
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
                                        new SyncItemId(item.item.itemId.id),
                                        item.item.quantity), 
                                item.quantityReserved,
                                item.unitPrice
                            )
                        ),
                        internalDoc.orderState as SyncOrderState, 
                        new Date(internalDoc.creationDate),
                        internalDoc.warehouseDeparture,
                        internalDoc.warehouseDestination,
                        new SyncOrderId(internalDoc.sellOrderReference.id)
                );
            }

            // Cerca un SellOrder con quell'id
            const sellDoc = await this.syncSellOrderModel.findOne(
                { "orderId.id": id.getId() }).lean().exec() as any;

                if (sellDoc) {
                // Ritorna l'oggetto ordine convertito da Document a Domain
                return new SyncSellOrder(
                    new SyncOrderId(sellDoc.orderId.id),
                    sellDoc.items.map(item => 
                        new SyncOrderItemDetail(
                                new SyncOrderItem(
                                    new SyncItemId(item.item.itemId.id),
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
            this.logger.error("Errore durante la ricerca dell'ordine per ID:", error);
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
            this.logger.error("Errore durante la ricerca dello stato dell'ordine:", error);
            throw error;
        }
    }

    // NB: A differenza di getAllOrders, qui prende solo gli ordini PENDING o PROCESSING (per il s.c.)
    async getAllFilteredOrders(): Promise<SyncOrders> {
        try {
            this.logger.log('[Repository] Recupero internalDocs da filtrare...');
            const internalDocs = await this.syncInternalOrderModel.find().lean().exec() as any[];
            this.logger.log('[Repository] InternalDocs trovati:', internalDocs.length);
            
            this.logger.log('[Repository] Recupero sellDocs da filtrare...');
            const sellDocs = await this.syncSellOrderModel.find().lean().exec() as any[];
            this.logger.log('[Repository] SellDocs trovati:', sellDocs.length);

            // Conversione da documento a dominio con filtro
            const internalOrders = internalDocs
                .filter(doc => {
                    const isValid = doc.orderState === SyncOrderState.PENDING || doc.orderState === SyncOrderState.PROCESSING;
                    this.logger.log(`[Repository] InternalOrder ${doc.orderId?.id} - Stato: ${doc.orderState}, Valido: ${isValid}`);
                    return isValid;
                })
                .map(doc => {
                    try {
                        this.logger.log(`[Repository] Conversione InternalOrder: ${doc.orderId?.id}`);
                        return new SyncInternalOrder(
                            new SyncOrderId(doc.orderId.id),
                            (doc.items || []).map(item => 
                                new SyncOrderItemDetail(
                                    new SyncOrderItem(
                                        new SyncItemId(item.item.itemId.id),
                                        item.item.quantity
                                    ), 
                                    item.quantityReserved,
                                    item.unitPrice
                                )
                            ),
                            doc.orderState as SyncOrderState,
                            new Date(doc.creationDate),
                            doc.warehouseDeparture,
                            doc.warehouseDestination,
                            new SyncOrderId(doc.sellOrderReference.id)
                        );
                    } catch (error) {
                        this.logger.error('[Repository] Errore conversione internalDoc:', error);
                        this.logger.error('[Repository] Doc che causa errore:', JSON.stringify(doc, null, 2));
                        throw new Error(`Errore conversione internalDoc: ${error.message}`);
                    }
                });

            // Conversione da documento a dominio con filtro
            const sellOrders = sellDocs
                .filter(doc => {
                    const isValid = doc.orderState === SyncOrderState.PENDING || doc.orderState === SyncOrderState.PROCESSING;
                    this.logger.log(`[Repository] SellOrder ${doc.orderId?.id} - Stato: ${doc.orderState}, Valido: ${isValid}`);
                    return isValid;
                })
                .map(doc => {
                    try {
                        this.logger.log(`[Repository] Conversione SellOrder: ${doc.orderId?.id}`);
                        return new SyncSellOrder(
                            new SyncOrderId(doc.orderId.id),
                            (doc.items || []).map(item => 
                                new SyncOrderItemDetail(
                                    new SyncOrderItem(
                                        new SyncItemId(item.item.itemId.id),
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
                        this.logger.error('[Repository] Errore conversione sellDoc:', error);
                        this.logger.error('[Repository] Doc che causa errore:', JSON.stringify(doc, null, 2));
                        throw new Error(`Errore conversione sellDoc: ${error.message}`);
                    }
                });

            this.logger.log(`[Repository] Conversione completata: ${internalOrders.length} internal, ${sellOrders.length} sell`);
            return new SyncOrders(sellOrders, internalOrders);
            
        } catch (error) {
            this.logger.error('[Repository] Errore durante il recupero di tutti gli ordini filtrati:', error);
            this.logger.error('[Repository] Stack trace:', error.stack);
            throw new Error(`Errore durante il recupero di tutti gli ordini filtrati: ${error.message}`);
        }
    }

    async getAllOrders(): Promise<SyncOrders> {
        try {
            this.logger.log('[Repository] Recupero internalDocs...');
            const internalDocs = await this.syncInternalOrderModel.find().lean().exec() as any[];
            this.logger.log('[Repository] InternalDocs trovati:', internalDocs.length);
            
            this.logger.log('[Repository] Recupero sellDocs...');
            const sellDocs = await this.syncSellOrderModel.find().lean().exec() as any[];
            this.logger.log('[Repository] SellDocs trovati:', sellDocs.length);

            // Conversione da documento a dominio (senza filtro)
            const internalOrders = internalDocs.map(doc => {
                    try {
                        this.logger.log(`[Repository] Conversione InternalOrder: ${doc.orderId?.id}`);
                        return new SyncInternalOrder(
                            new SyncOrderId(doc.orderId.id),
                            (doc.items || []).map(item => 
                                new SyncOrderItemDetail(
                                    new SyncOrderItem(
                                        new SyncItemId(item.item.itemId.id),
                                        item.item.quantity
                                    ), 
                                    item.quantityReserved,
                                    item.unitPrice
                                )
                            ),
                            doc.orderState as SyncOrderState,
                            new Date(doc.creationDate),
                            doc.warehouseDeparture,
                            doc.warehouseDestination,
                            new SyncOrderId(doc.sellOrderReference.id)
                        );
                    } catch (error) {
                        this.logger.error('[Repository] Errore conversione internalDoc:', error);
                        this.logger.error('[Repository] Doc che causa errore:', JSON.stringify(doc, null, 2));
                        throw new Error(`Errore conversione internalDoc: ${error.message}`);
                    }
                });

            // Conversione da documento a dominio (senza filtro)
            const sellOrders = sellDocs.map(doc => {
                    try {
                        this.logger.log(`[Repository] Conversione SellOrder: ${doc.orderId?.id}`);
                        return new SyncSellOrder(
                            new SyncOrderId(doc.orderId.id),
                            (doc.items || []).map(item => 
                                new SyncOrderItemDetail(
                                    new SyncOrderItem(
                                        new SyncItemId(item.item.itemId.id),
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
                        this.logger.error('[Repository] Errore conversione sellDoc:', error);
                        this.logger.error('[Repository] Doc che causa errore:', JSON.stringify(doc, null, 2));
                        throw new Error(`Errore conversione sellDoc: ${error.message}`);
                    }
                });

            this.logger.log(`[Repository] Conversione completata: ${internalOrders.length} internal, ${sellOrders.length} sell`);
            return new SyncOrders(sellOrders, internalOrders);
            
        } catch (error) {
            this.logger.error('[Repository] Errore durante il recupero di tutti gli ordini:', error);
            this.logger.error('[Repository] Stack trace:', error.stack);
            throw new Error(`Errore durante il recupero di tutti gli ordini: ${error.message}`);
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
                        itemId: { id: item.getItem().getItemId().getId()},
                        quantity: item.getItem().getQuantity()
                    },
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
            
            this.logger.log('Aggiunto con successo il SellOrder con ID:', newOrder.getOrderId());
            
        } catch (error) {
            this.logger.error("Errore durante l'aggiunta del SellOrder:", error);
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
                order.getWarehouseDestination(),
                order.getSellOrderReference()
            );

            // Salva l'ordine
            const orderData = {
                orderId: {
                    id: newOrder.getOrderId()
                },
                items: newOrder.getItemsDetail().map(item => ({
                    item: {
                        itemId: { id: item.getItem().getItemId().getId()},
                        quantity: item.getItem().getQuantity()
                    },
                    quantityReserved: item.getQuantityReserved(),
                    unitPrice: item.getUnitPrice()
                })),
                orderState: newOrder.getOrderState(),
                creationDate: newOrder.getCreationDate(),
                warehouseDeparture: newOrder.getWarehouseDeparture(),
                warehouseDestination: newOrder.getWarehouseDestination(),
                sellOrderReference: newOrder.getSellOrderReference()
            };

            const createdOrder = new this.syncInternalOrderModel(orderData);
            await createdOrder.save();
            this.logger.log('[AggregateO] Sincronizzato il nuovo InternalOrder con ID:', newOrder.getOrderId());
                        
        } catch (error) {
            this.logger.error("Errore durante l'aggiunta dell'InternalOrder:", error);
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
                                    new SyncItemId(item.item.itemId.id),
                                    item.item.quantity), 
                            item.quantityReserved,
                            item.unitPrice
                        )
                    ),
                    internalDoc.orderState as SyncOrderState, 
                    new Date(internalDoc.creationDate),
                    internalDoc.warehouseDeparture,
                    internalDoc.warehouseDestination,
                    new SyncOrderId(internalDoc.sellOrderReference.id)
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
                                    new SyncItemId(item.item.itemId.id),
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
            this.logger.log("[AggregateO] Aggiornato lo stato dell'ordine ", id.getId(), " a ", state );

            // Fallback
            throw new Error(`Impossibile aggiornare lo stato: ordine con ID ${id.getId()} non trovato`);
        } catch (error) {
            this.logger.error("Errore durante l'aggiornamento dello stato dell'ordine:", error);
            throw error;
        }
    }
 

    async syncUpdateReservedStock(id: SyncOrderId, items: SyncOrderItem[]): Promise<void> {
        this.logger.log("Inizio update QtyReserved nella repository");
        try {
            // Trova tipo di ordine e documento
            const internalDoc = await this.syncInternalOrderModel.findOne({ 
                "orderId.id": id.getId() 
            }).lean().exec() as any;

            let model: any;
            let mapper: (doc: any) => Promise<SyncInternalOrder | SyncSellOrder>;
            let currentDoc: any;

            if (internalDoc) {
                model = this.syncInternalOrderModel;
                currentDoc = internalDoc;
                mapper = async (doc) => {
                    const internalOrderDTO = {
                        orderId: doc.orderId,
                        items: doc.items,
                        orderState: doc.orderState,
                        creationDate: doc.creationDate,
                        warehouseDeparture: doc.warehouseDeparture,
                        warehouseDestination: doc.warehouseDestination,
                        sellOrderReference: doc.SellOrderReference
                    };
                    return this.mapper.syncInternalOrderToDomain(internalOrderDTO);
                };
            } else {
                const sellDoc = await this.syncSellOrderModel.findOne({ 
                "orderId.id": id.getId() 
                }).lean().exec() as any;

                model = this.syncSellOrderModel;
                currentDoc = sellDoc;

                mapper = async (doc) => {
                    const sellOrderDTO = {
                        orderId: doc.orderId,
                        items: doc.items,
                        orderState: doc.orderState,
                        creationDate: doc.creationDate,
                        warehouseDeparture: doc.warehouseDeparture,
                        destinationAddress: doc.destinationAddress
                    };
                    return this.mapper.syncSellOrderToDomain(sellOrderDTO);
                };
            }

        // Prepara e esegui gli aggiornamenti
        const updateOperations = items.map(item => {
            // Trova l'item corrispondente nel documento corrente
            const currentItem = currentDoc.items.find((docItem: any) => 
                docItem.item.itemId.id === item.getItemId().getId()
            );

            if (!currentItem) {
                throw new Error(`Item con ID ${item.getItemId().getId()} non trovato nell'ordine`);
            }

            const currentQuantity = currentItem.item.quantity; // Quantity tot. richiesta
            const newReservedQuantity = currentQuantity - item.getQuantity(); // Calcolo (qtyRes = qty tot. richiesta - qty ancora da riservare)

            return {
                updateOne: {
                    filter: { 
                        "orderId.id": id.getId(),
                        "items.item.itemId.id": item.getItemId().getId()
                    },
                    update: {
                        $set: { 
                            "items.$.quantityReserved": newReservedQuantity
                        }
                    }
                }
            };
        });            
        
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

            this.logger.log("Update QtyReserved nella repository riuscito!");
                        
        } catch (error) {
            this.logger.error("Errore durante l'aggiornamento della quantità riservata:", error);
            throw new Error(`Impossibile trovare l'ordine con ID ${id.getId()}`);
        }
    }

    async syncUnreservedStock(id: SyncOrderId): Promise<void> {
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
                    const internalOrderDTO = {
                        orderId: doc.orderId,
                        items: doc.items,
                        orderState: doc.orderState,
                        creationDate: doc.creationDate,
                        warehouseDeparture: doc.warehouseDeparture,
                        warehouseDestination: doc.warehouseDestination,
                        sellOrderReference: doc.SellOrderReference
                    };
                    return this.mapper.syncInternalOrderToDomain(internalOrderDTO);
                };
            } else {
                model = this.syncSellOrderModel;
                mapper = async (doc) => {
                    const sellOrderDTO = {
                        orderId: doc.orderId,
                        items: doc.items,
                        orderState: doc.orderState,
                        creationDate: doc.creationDate,
                        warehouseDeparture: doc.warehouseDeparture,
                        destinationAddress: doc.destinationAddress
                    };
                    return this.mapper.syncSellOrderToDomain(sellOrderDTO);
                };
            }

            // Prepara e esegui gli aggiornamenti
            const updateOperations = {
                updateOne: {
                    filter: { 
                    "orderId.id": id.getId() 
                    },
                    update: {
                        $set: { 
                            "items.$[].quantityReserved": 0   // aggiorna tutti gli elementi dell'array
                        }
                    }
                }
            };

            await model.bulkWrite(updateOperations);
            
            // Recupera il documento aggiornato
            const updatedDoc = await model.findOne({ 
                "orderId.id": id.getId() 
            }).lean().exec();
            
            if (!updatedDoc) {
                throw new Error(`Ordine con ID ${id.getId()} non trovato dopo l'aggiornamento`);
            }
                        
        } catch (error) {
            console.error("Errore durante l'aggiornamento della quantità riservata:", error);
            throw new Error(`Impossibile trovare l'ordine con ID ${id.getId()}`);
        }
    }
}