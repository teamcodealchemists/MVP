import { Injectable, Inject, NotFoundException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { DataMapper } from "src/infrastructure/mappers/data.mapper";
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
import { v4 as uuidv4 } from 'uuid';
import { RpcException } from '@nestjs/microservices';
import { InternalOrderDTO } from "src/interfaces/dto/internalOrder.dto";
import { OrderIdDTO } from "src/interfaces/dto/orderId.dto";
import { SellOrderDTO } from "src/interfaces/dto/sellOrder.dto";
import { OrderStateDTO } from "src/interfaces/dto/orderState.dto";

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
                // Ritorna l'oggetto ordine convertito da Document a Domain
                return new InternalOrder(
                        new OrderId(internalDoc.orderId.id),
                        internalDoc.items.map(item =>
                            new OrderItemDetail(
                                    new OrderItem(
                                        new ItemId(item.item.itemId.id),
                                        item.item.quantity), 
                                item.quantityReserved,
                                item.unitPrice
                            )
                        ),
                        internalDoc.orderState as OrderState, 
                        new Date(internalDoc.creationDate),
                        internalDoc.warehouseDeparture,
                        internalDoc.warehouseDestination,
                        new OrderId(internalDoc.sellOrderReference.id)
                );
            }

            // Se non trovato, cerca un SellOrder con quell'id
            const sellDoc = await this.sellOrderModel.findOne(
                { "orderId.id": id.getId() }).lean().exec() as any;

                if (sellDoc) {
                // Ritorna l'oggetto ordine convertito da Document a Domain
                return new SellOrder(
                    new OrderId(sellDoc.orderId.id),
                    sellDoc.items.map(item => 
                        new OrderItemDetail(
                                new OrderItem(
                                    new ItemId(item.item.itemId.id),
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
            Logger.error("Errore durante la ricerca dell'ordine per ID:"+ error, 'OrdersRepositoryMongo');
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
            const internalDocs = await this.internalOrderModel.find().lean().exec() as any[];
            const sellDocs = await this.sellOrderModel.find().lean().exec() as any[];
            
            console.log('Internal docs:', JSON.stringify(internalDocs, null, 2));
            console.log('Sell docs:', JSON.stringify(sellDocs, null, 2));
        // Conversione da documento a dominio
            const internalOrders = internalDocs.map(doc => {
                try {
                    return new InternalOrder(
                        new OrderId(doc.orderId.id),
                        (doc.items || []).map(item => 
                            new OrderItemDetail(
                                new OrderItem(
                                    new ItemId(item.item.itemId.id),
                                    item.item.quantity
                                ), 
                                item.quantityReserved,
                                item.unitPrice
                            )
                        ),
                        doc.orderState as OrderState,
                        new Date(doc.creationDate),
                        doc.warehouseDeparture,
                        doc.warehouseDestination,
                        new OrderId(doc.sellOrderReference.id)
                    );
                } catch (error) {
                    throw new Error('Errore conversione internalDoc:' + error.message);
                }
            });
        // Conversione da documento a dominio
            const sellOrders = sellDocs.map(doc => {
                try {
                    return new SellOrder(
                        new OrderId(doc.orderId.id),
                        (doc.items || []).map(item => 
                            new OrderItemDetail(
                                new OrderItem(
                                    new ItemId(item.item.itemId.id),
                                    item.item.quantity
                                ), 
                                item.quantityReserved,
                                item.unitPrice
                            )
                        ),
                        doc.orderState as OrderState,
                        new Date(doc.creationDate),
                        doc.warehouseDeparture,
                        doc.destinationAddress
                    );
                } catch (error) {
                    throw new Error('Errore conversione sellDoc:'+ error.message);
                }
            });

            return Promise.resolve(new Orders(sellOrders, internalOrders));
            
        } catch (error) {
            throw new Error ("Errore durante il recupero di tutti gli ordini:", error);
        }
    }

    async addSellOrder(order: SellOrder): Promise<void> {
        try {          
            const newOrder = new SellOrder(
                new OrderId(order.getOrderId()),
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

            const createdOrder = new this.sellOrderModel(orderData);
            await createdOrder.save();
            
            console.log('Aggiunto con successo il SellOrder con ID:', newOrder.getOrderId());
            
        } catch (error) {
            console.error("Errore durante l'aggiunta del SellOrder:", error);
            throw error;
        }
    }

    async addInternalOrder(order: InternalOrder): Promise<void> {
        try {          
            // Crea il nuovo ordine con l'ID unico
            const newOrder = new InternalOrder(
                new OrderId(order.getOrderId()),
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

            const createdOrder = new this.internalOrderModel(orderData);
            await createdOrder.save();
            
            console.log('Aggiunto con successo l\'InternalOrder con ID:', newOrder.getOrderId());
            
        } catch (error) {
            console.error("Errore durante l'aggiunta dell'InternalOrder:", error);
            throw error;
        }
    }

    async removeById(id: OrderId): Promise<boolean> {
        // Per cancellazione ordine
        const currentState = await this.getState(id);

        // Controlla se può essere cancellato

        if (currentState === OrderState.COMPLETED) {
            throw new RpcException('Impossibile cancellare un ordine COMPLETED');
        }

        if (currentState === OrderState.CANCELED) {
            return false; // L'ordine era già cancellato
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
                                    new ItemId(item.item.itemId.id),
                                    item.item.quantity), 
                            item.quantityReserved,
                            item.unitPrice
                        )
                    ),
                    internalDoc.orderState as OrderState, 
                    new Date(internalDoc.creationDate),
                    internalDoc.warehouseDeparture,
                    internalDoc.warehouseDestination,
                    new OrderId(internalDoc.sellOrderReference.id)
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
                                    new ItemId(item.item.itemId.id),
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
            console.log("Aggiornato lo stato dell'ordine ", id.getId(), " a ", state );

            // Fallback
            throw new Error(`Impossibile aggiornare lo stato: ordine con ID ${id.getId()} non trovato`);
        } catch (error) {
            console.error("Errore durante l'aggiornamento dello stato dell'ordine:", error);
            throw error;
        }
    }


    async genUniqueId(orderType: 'S' | 'I'): Promise<OrderId> {
        while (true) {            
            const randomId = uuidv4();
            const fullOrderId = `${orderType}${randomId}`;
            console.log("Generato ID:", fullOrderId);
            // L'UUID v4 ha % vicine allo zero di creare duplicati, ma metto comunque il controllo (locale) duplicati 
            try {
                const orderIdToCheck = new OrderId(fullOrderId);
                // Controllo se l'id creato è univoco
                console.log(`Verifica unicità per ID: ${fullOrderId}`);
                try {
                    const existingOrder = await this.getById(orderIdToCheck);
                    // Se va a questa prossima riga, l'ordine esiste già
                    console.log(`ID ${fullOrderId} già esistente.`);
                    
                } catch (error) {
                    // Se getById returna existingOrder = null/undefined o eccezione, l'ID è univoco
                    console.log(`ID univoco generato: ${fullOrderId}`);
                    return orderIdToCheck;
                }
            } catch (error) {
                throw new Error(`Errore durante la verifica dell'ID ${fullOrderId}:`, error);
            }
        }
    }
 

    async updateReservedStock(id: OrderId, items: OrderItemDetail[]): Promise<InternalOrder | SellOrder> {
        try {
            // Trova tipo di ordine e documento
            const internalDoc = await this.internalOrderModel.findOne({ 
                "orderId.id": id.getId() 
            }).lean().exec() as any;

            let model: any;

            if (internalDoc) {
                model = this.internalOrderModel;
            } else {
                // Prova con SellOrder
                const sellDoc = await this.sellOrderModel.findOne({ 
                    "orderId.id": id.getId() 
                }).lean().exec() as any;
                if (sellDoc) {
                    model = this.sellOrderModel;
                } else {
                    throw new Error(`Ordine con ID ${id.getId()} non trovato`);
                }
            }

            // Prepara e esegui gli aggiornamenti
            const updateOperations = items.map(item => ({
                updateOne: {
                    filter: { 
                        "orderId.id": id.getId(),
                        "items.item.itemId.id": item.getItem().getItemId().getId()
                    },
                    update: {
                        $set: { 
                            "items.$.quantityReserved": item.getQuantityReserved()
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

            Logger.debug(`Documento aggiornato: ${JSON.stringify(updatedDoc, null, 2)}`, 'OrdersRepositoryMongo');
            
            // Converti a dominio e restituisci il documento aggiornato
            if (updatedDoc.warehouseDestination) {
                let internalOrderDto = new InternalOrderDTO();
                let orderIdDto = new OrderIdDTO();
                orderIdDto.id = updatedDoc.orderId.id;
                internalOrderDto.orderId = orderIdDto;
                internalOrderDto.items = updatedDoc.items.map((item: any) => ({
                    item: { itemId: { id: item.item.itemId.id }, quantity: item.item.quantity },
                    quantityReserved: item.quantityReserved,
                    unitPrice: item.unitPrice
                }));
                // --- FIX: Check and log orderState ---
                if (!updatedDoc.orderState) {
                    Logger.error(`orderState mancante per InternalOrder ID ${updatedDoc.orderId.id}`, 'OrdersRepositoryMongo');
                    throw new Error(`Stato ordine non valido NOU: ${updatedDoc.orderState}. Stati validi: PENDING, PROCESSING, SHIPPED, CANCELED, COMPLETED`);
                }
                let orderStateDto = new OrderStateDTO();
                orderStateDto.orderState = updatedDoc.orderState;
                internalOrderDto.orderState = orderStateDto;
                internalOrderDto.creationDate = updatedDoc.creationDate;
                internalOrderDto.warehouseDeparture = updatedDoc.warehouseDeparture;
                internalOrderDto.warehouseDestination = updatedDoc.warehouseDestination;
                let orderRef = new OrderIdDTO();
                orderRef.id = updatedDoc.sellOrderReference?.id;
                internalOrderDto.sellOrderReference = orderRef;

                return this.mapper.internalOrderToDomain(internalOrderDto);
            } else {
                let sellOrderDto = new SellOrderDTO();
                let orderIdDto = new OrderIdDTO();
                orderIdDto.id = updatedDoc.orderId.id;
                sellOrderDto.orderId = orderIdDto;
                sellOrderDto.items = updatedDoc.items.map((item: any) => ({
                    item: { itemId: { id: item.item.itemId.id }, quantity: item.item.quantity },
                    quantityReserved: item.quantityReserved,
                    unitPrice: item.unitPrice
                }));
                sellOrderDto.orderState = updatedDoc.orderState;
                sellOrderDto.creationDate = updatedDoc.creationDate;
                sellOrderDto.warehouseDeparture = updatedDoc.warehouseDeparture;
                sellOrderDto.destinationAddress = updatedDoc.destinationAddress;
                return this.mapper.sellOrderToDomain(sellOrderDto);
            }

        } catch (error) {
            console.error("Errore durante l'aggiornamento della quantità riservata:", error);
            throw new Error(`Impossibile trovare l'ordine con ID ${id.getId()}`);
        }
    }


    async checkReservedQuantityForSellOrder(sellOrder: SellOrder): Promise<void> {
        try {
            const stringId = sellOrder.getOrderId();
            const orderId = new OrderId(stringId);
            
            // Cerca direttamente nel modello SellOrder
            const sellDoc = await this.sellOrderModel.findOne(
                { "orderId.id": orderId.getId() }
            ).lean().exec() as any;

            if (!sellDoc) {
                throw new NotFoundException('SellOrder non trovato');
            }

            // Converti il documento in dominio
            const foundOrder = new SellOrder(
                new OrderId(sellDoc.orderId.id),
                sellDoc.items.map(item => 
                    new OrderItemDetail(
                        new OrderItem(
                            new ItemId(item.item.itemId.id),
                            item.item.quantity
                        ), 
                        item.quantityReserved,
                        item.unitPrice
                    )
                ),
                sellDoc.orderState as OrderState,
                new Date(sellDoc.creationDate),
                sellDoc.warehouseDeparture,
                sellDoc.destinationAddress
            );

            const items = foundOrder.getItemsDetail();
            let allFullyReserved = true;
            
            items.forEach((itemDetail: OrderItemDetail) => {
                const itemId = itemDetail.getItem().getItemId().getId();
                const reservedQty = itemDetail.getQuantityReserved();
                const orderedQty = itemDetail.getItem().getQuantity();
                
                console.log(`SellOrder - Item: ${itemId}, Ordered: ${orderedQty}, Reserved: ${reservedQty}`);
                
                if (reservedQty !== orderedQty) {
                    allFullyReserved = false;
                }
            });
            
            if (!allFullyReserved) {
                throw new Error('Quantità riservata insufficiente per alcuni items');
            }
            
        } catch (error) {
            console.error(`Errore in checkReservedQuantityForSellOrder: ${error.message}`);
            throw error;
        }
    }

        
    async checkReservedQuantityForInternalOrder(internalOrder: InternalOrder): Promise<void> {
        try {
            const stringId = internalOrder.getOrderId();
            const orderId = new OrderId(stringId);
            
            // Cerca direttamente nel modello InternalOrder
            const internalDoc = await this.internalOrderModel.findOne(
                { "orderId.id": orderId.getId() }
            ).lean().exec() as any;

            if (!internalDoc) {
                throw new NotFoundException('InternalOrder non trovato');
            }

            // Converti il documento in dominio
            const foundOrder = new InternalOrder(
                new OrderId(internalDoc.orderId.id),
                internalDoc.items.map(item => 
                    new OrderItemDetail(
                        new OrderItem(
                            new ItemId(item.item.itemId.id),
                            item.item.quantity
                        ), 
                        item.quantityReserved,
                        item.unitPrice
                    )
                ),
                internalDoc.orderState as OrderState,
                new Date(internalDoc.creationDate),
                internalDoc.warehouseDeparture,
                internalDoc.warehouseDestination,
                internalDoc.sellOrderReference
            );

            const items = foundOrder.getItemsDetail();
            let allFullyReserved = true;
            
            items.forEach((itemDetail: OrderItemDetail) => {
                const itemId = itemDetail.getItem().getItemId().getId();
                const reservedQty = itemDetail.getQuantityReserved();
                const orderedQty = itemDetail.getItem().getQuantity();
                
                console.log(`InternalOrder - Item: ${itemId}, Ordered: ${orderedQty}, Reserved: ${reservedQty}`);
                
                if (reservedQty !== orderedQty) {
                    allFullyReserved = false;
                }
            });
            
            if (!allFullyReserved) {
                throw new Error('Quantità riservata insufficiente per alcuni items');
            }
            
        } catch (error) {
            console.error(`Errore in checkReservedQuantityForInternalOrder: ${error.message}`);
            throw error;
        }
    }
}