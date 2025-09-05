import { SyncInternalOrder } from "src/domain/syncInternalOrder.entity";
import { SyncSellOrder } from "src/domain/syncSellOrder.entity";
import { SyncOrderItem } from "src/domain/syncOrderItem.entity";
import { SyncOrderItemDetail } from "src/domain/syncOrderItemDetail.entity";
import { SyncOrderState } from "src/domain/syncOrderState.enum";
import { SyncOrderId } from "src/domain/syncOrderId.entity";
import { SyncOrders } from "src/domain/syncOrders.entity";
import { SyncItemId } from "src/domain/syncItemId.entity";

import { SyncInternalOrderDTO } from "src/interfaces/dto/syncInternalOrder.dto";
import { SyncSellOrderDTO } from "src/interfaces/dto/syncSellOrder.dto";
import { SyncOrderItemDTO } from "src/interfaces/dto/syncOrderItem.dto";
import { SyncOrderItemDetailDTO } from "src/interfaces/dto/syncOrderItemDetail.dto";
import { SyncOrderStateDTO } from "src/interfaces/dto/syncOrderState.dto";
import { SyncOrderIdDTO } from "src/interfaces/dto/syncOrderId.dto";
import { SyncOrdersDTO } from "src/interfaces/dto/syncOrders.dto";
import { SyncOrderQuantityDTO } from "src/interfaces/dto/syncOrderQuantity.dto";


export class CloudDataMapper {

    // DTO ===> DOMAIN

    async syncInternalOrderToDomain(orderDTO: SyncInternalOrderDTO): Promise<SyncInternalOrder> {
    // Validazione: Non si può partire e arrivare allo stesso magazzino
    if (orderDTO.warehouseDeparture === orderDTO.warehouseDestination) {
        throw new Error(`Il magazzino di partenza (${orderDTO.warehouseDeparture}) non può essere uguale alla destinazione`);
    }

    return new SyncInternalOrder(
        await this.syncOrderIdToDomain(orderDTO.orderId), 
        await Promise.all(orderDTO.items.map(i => this.syncOrderItemDetailToDomain(i))), 
        await this.syncOrderStateToDomain(orderDTO.orderState),
        orderDTO.creationDate,
        orderDTO.warehouseDeparture,
        orderDTO.warehouseDestination
    );
    }


    async syncSellOrderToDomain(orderDTO: SyncSellOrderDTO): Promise<SyncSellOrder> {
    return new SyncSellOrder(
        await this.syncOrderIdToDomain(orderDTO.orderId),
        await Promise.all(orderDTO.items.map(i => this.syncOrderItemDetailToDomain(i))),
        await this.syncOrderStateToDomain(orderDTO.orderState),
        orderDTO.creationDate,
        orderDTO.warehouseDeparture,
        orderDTO.destinationAddress
    );        
    }


    async syncOrderItemToDomain(dto: SyncOrderItemDTO): Promise<SyncOrderItem> {
        return new SyncOrderItem(
                new SyncItemId(dto.itemId.id),
                dto.quantity
            );
    }


    async syncOrderIdToDomain(dto: SyncOrderIdDTO): Promise<SyncOrderId> {
    return new SyncOrderId(dto.id);
    }


    async syncOrderStateToDomain(dto: SyncOrderStateDTO): Promise<SyncOrderState> {
    const state = dto.orderState;
    
    if (!Object.values(SyncOrderState).includes(state as SyncOrderState)) {
        throw new Error(`Stato ordine non valido: ${state}. Stati validi: ${Object.values(SyncOrderState).join(', ')}`);
    }
    return state as SyncOrderState;
    }


    async syncOrderItemDetailToDomain(dto: SyncOrderItemDetailDTO): Promise<SyncOrderItemDetail> {
    // quantityReserved NON può esser maggiore della quantity totale ordinata
    if (dto.quantityReserved > dto.item.quantity) {
        throw new Error(`Quantità riservata (${dto.quantityReserved}) maggiore della quantità ordinata (${dto.item.quantity})`);
    }

    return new SyncOrderItemDetail(
        await this.syncOrderItemToDomain(dto.item),
        dto.quantityReserved,
        dto.unitPrice
    );
    }


    // DOMAIN ===> DTO

    async syncInternalOrderToDTO(entity: SyncInternalOrder): Promise<SyncInternalOrderDTO> {
        
        const internalOrderDTO: SyncInternalOrderDTO = {
            orderId: await this.syncOrderIdToDTO(entity['orderId']),
            items: await Promise.all(
                entity.getItemsDetail().map(d => this.syncOrderItemDetailToDTO(d))
            ),
            orderState: await this.syncOrderStateToDTO(entity.getOrderState()),
            creationDate: entity.getCreationDate(),
            warehouseDeparture: entity.getWarehouseDeparture(),
            warehouseDestination: entity.getWarehouseDestination()
        };

        return internalOrderDTO;
    }


    async syncSellOrderToDTO(entity: SyncSellOrder): Promise<SyncSellOrderDTO> {
        
        const sellOrderDTO: SyncSellOrderDTO = {
            orderId: await this.syncOrderIdToDTO(entity['orderId']),
            items: await Promise.all(
                entity.getItemsDetail().map(d => this.syncOrderItemDetailToDTO(d))
            ),
            orderState: await this.syncOrderStateToDTO(entity.getOrderState()),
            creationDate: entity.getCreationDate(),
            warehouseDeparture: entity.getWarehouseDeparture(),
            destinationAddress: entity.getDestinationAddress()
        };

        return sellOrderDTO;
    }


    async syncOrderItemToDTO(entity: SyncOrderItem): Promise<SyncOrderItemDTO> {
        return {
            itemId: { id: entity.getItemId() },
            quantity: entity.getQuantity()
        };
    }


    async syncOrderIdToDTO(entity: SyncOrderId): Promise<SyncOrderIdDTO> {
        return { id: entity.getId() };
    }


    async syncOrderStateToDTO(state: SyncOrderState): Promise<SyncOrderStateDTO> {
        return { orderState: state };
    }


    async syncOrderItemDetailToDTO(entity: SyncOrderItemDetail): Promise<SyncOrderItemDetailDTO> {
        return {
            item: await this.syncOrderItemToDTO(entity.getItem()),
            quantityReserved: entity.getQuantityReserved(),
            unitPrice: entity.getUnitPrice()
        };
    }


    async syncOrderQuantityToDTO(orderId: SyncOrderId, items: SyncOrderItem[]): Promise<SyncOrderQuantityDTO> {
        return {
            id: await this.syncOrderIdToDTO(orderId),
            items: await Promise.all(items.map(i => this.syncOrderItemToDTO(i)))
        };
    }


    async syncOrdersToDTO(orders: SyncOrders): Promise<SyncOrdersDTO> {
        try {
            console.log('[DataMapper] Conversione SyncOrders a DTO...');
            
            const sellOrders = await Promise.all(
                orders.getSellOrders().map(async (order, index) => {
                    try {
                        console.log(`[DataMapper] Conversione SellOrder ${index + 1}: ${order.getOrderId()}`);
                        return await this.syncSellOrderToDTO(order);
                    } catch (error) {
                        console.error(`[DataMapper] Errore conversione SellOrder ${order.getOrderId()}:`, error);
                        throw error;
                    }
                })
            );

            const internalOrders = await Promise.all(
                orders.getInternalOrders().map(async (order, index) => {
                    try {
                        console.log(`[DataMapper] Conversione InternalOrder ${index + 1}: ${order.getOrderId()}`);
                        return await this.syncInternalOrderToDTO(order);
                    } catch (error) {
                        console.error(`[DataMapper] Errore conversione InternalOrder ${order.getOrderId()}:`, error);
                        throw error;
                    }
                })
            );

            console.log('[DataMapper] Conversione completata con successo');
            return { sellOrders, internalOrders };
            
        } catch (error) {
            console.error('[DataMapper] Errore in syncOrdersToDTO:', error);
            throw error;
        }
    }
}
