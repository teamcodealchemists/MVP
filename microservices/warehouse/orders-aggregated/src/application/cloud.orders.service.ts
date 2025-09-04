import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SyncOrders } from "src/domain/syncOrders.entity";
import { SyncOrderItem } from "src/domain/syncOrderItem.entity";
import { SyncOrderItemDetail } from "src/domain/syncOrderItemDetail.entity";
import { SyncOrderState } from "src/domain/syncOrderState.enum";

import { SyncOrderId } from "src/domain/syncOrderId.entity";
import { SyncInternalOrder } from "src/domain/syncInternalOrder.entity";
import { SyncSellOrder } from "src/domain/syncSellOrder.entity";
import { CloudOrdersRepositoryMongo } from '../infrastructure/adapters/mongodb/cloud.orders.repository.impl';
import { CloudOutboundEventAdapter } from '../infrastructure/adapters/cloudOutboundEvent.adapter';

@Injectable()   
export class CloudOrdersService {
    constructor(
    @Inject('CLOUDORDERSREPOSITORY')
    private readonly cloudOrdersRepositoryMongo: CloudOrdersRepositoryMongo,
    private readonly cloudOutboundEventAdapter: CloudOutboundEventAdapter
    ) {}

    async syncUpdateOrderState(id: SyncOrderId, state: SyncOrderState): Promise<void> {
        console.log("[AggregateO] Ricevuto segnale di updateState per l'ordine ", id.getId());
        // Aggiorna lo stato nella repository
        await this.cloudOrdersRepositoryMongo.syncUpdateOrderState(id, state);

    }    
    
    async syncCreateSellOrder(order: SyncSellOrder): Promise<void>{
        // Creo un nuovo SellOrder con stesso contenuto
        const orderWithUniqueId = new SyncSellOrder(
            new SyncOrderId(order.getOrderId()),
            order.getItemsDetail(),
            order.getOrderState(),
            order.getCreationDate(),
            order.getWarehouseDeparture(),
            order.getDestinationAddress()
        );
        console.log("[Aggregate] Creato SellOrder,", orderWithUniqueId);
        await this.cloudOrdersRepositoryMongo.syncAddSellOrder(orderWithUniqueId);       
    }

    async syncCreateInternalOrder(order: SyncInternalOrder): Promise<void>{
        // Creo un nuovo InternalOrder con stesso contenuto
        const orderWithUniqueId = new SyncInternalOrder(
            new SyncOrderId(order.getOrderId()),
            order.getItemsDetail(),
            order.getOrderState(),
            order.getCreationDate(),
            order.getWarehouseDeparture(),
            order.getWarehouseDestination()
        );
        console.log("[Aggregate] Creato InternalOrder,", orderWithUniqueId);
        await this.cloudOrdersRepositoryMongo.syncAddInternalOrder(orderWithUniqueId);
    }

    async syncCancelOrder(id: SyncOrderId): Promise<void> {
        const result = await this.cloudOrdersRepositoryMongo.syncRemoveById(id);
        if (result) { // Se true, è stato aggiornato
        console.log("[Aggregate] Cancellato l'ordine ", id);
        } else 
            console.error("[Aggregate] Errore: l'ordine ", id, " è già in stato CANCELED.");
    }

    async syncUpdateReservedStock(id: SyncOrderId, items: SyncOrderItem[]): Promise<void> {
        await this.cloudOrdersRepositoryMongo.syncUpdateReservedStock(id, items);
    }

}