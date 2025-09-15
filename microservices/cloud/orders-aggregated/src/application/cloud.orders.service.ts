import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { SyncOrderItem } from "src/domain/syncOrderItem.entity";
import { SyncOrderState } from "src/domain/syncOrderState.enum";

import { SyncOrderId } from "src/domain/syncOrderId.entity";
import { SyncInternalOrder } from "src/domain/syncInternalOrder.entity";
import { SyncSellOrder } from "src/domain/syncSellOrder.entity";
import { CloudOrdersRepositoryMongo } from '../infrastructure/adapters/mongodb/cloud.orders.repository.impl';

import { TelemetryService } from 'src/telemetry/telemetry.service';

@Injectable()   
export class CloudOrdersService {

    private readonly logger = new Logger(CloudOrdersService.name);
    
    constructor(
    @Inject('CLOUDORDERSREPOSITORY')
    private readonly cloudOrdersRepositoryMongo: CloudOrdersRepositoryMongo,
    private readonly TelemetryService: TelemetryService,
    ) {}

    async syncUpdateOrderState(id: SyncOrderId, state: SyncOrderState): Promise<void> {
        this.logger.log("[AggregateO] Ricevuto segnale di updateState per l'ordine", id.getId(), "a", state);
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
        this.TelemetryService.setInsertedOrders(1, order.getWarehouseDeparture());
        this.logger.log("[Aggregate] Creato SellOrder:", JSON.stringify(orderWithUniqueId, null, 2));
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
            order.getWarehouseDestination(),
            order.getSellOrderReference()
        );
        this.logger.log("[Aggregate] Creato InternalOrder:", JSON.stringify(orderWithUniqueId, null, 2) );
        this.TelemetryService.setInsertedOrders(1, order.getWarehouseDeparture());
        await this.cloudOrdersRepositoryMongo.syncAddInternalOrder(orderWithUniqueId);
    }

    async syncCancelOrder(id: SyncOrderId): Promise<void> {
        const result = await this.cloudOrdersRepositoryMongo.syncRemoveById(id);
        if (result) { // Se true, è stato aggiornato
        this.logger.log("[Aggregate] Cancellato l'ordine ", id);
        } else 
            this.logger.error("[Aggregate] Errore: l'ordine ", id, " è già in stato CANCELED.");
    }

    async syncUpdateReservedStock(id: SyncOrderId, items: SyncOrderItem[]): Promise<void> {
        await this.cloudOrdersRepositoryMongo.syncUpdateReservedStock(id, items);
    }

    async syncUnreserveStock(id: SyncOrderId): Promise<void> {
        await this.cloudOrdersRepositoryMongo.syncUnreservedStock(id);
    }

}