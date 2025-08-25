import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";
import { OrderId } from "src/domain/orderId.entity";
import { Orders } from "src/domain/orders.entity";
import { ItemId } from "src/domain/itemId.entity";

import { InternalOrderDTO } from "src/interfaces/dto/internalOrder.dto";
import { SellOrderDTO } from "src/interfaces/dto/sellOrder.dto";
import { OrderItemDTO } from "src/interfaces/dto/orderItem.dto";
import { OrderItemDetailDTO } from "src/interfaces/dto/orderItemDetail.dto";
import { OrderStateDTO } from "src/interfaces/dto/orderState.dto";
import { OrderIdDTO } from "src/interfaces/dto/orderId.dto";
import { OrdersDTO } from "src/interfaces/dto/orders.dto";
import { OrderQuantityDTO } from "src/interfaces/dto/orderQuantity.dto";
import { ItemIdDTO } from "src/interfaces/dto/itemId.dto";

/*
import { OrdersController } from "./orders.controller";
import { OutboundEventAdapter } from "src/infrastructure/adapters/outboundEvent.adapter";
*/

export class DataMapper {
    /*constructor(private readonly ordersController: OrdersController, 
                private readonly outboundEventAdapter: OutboundEventAdapter) {} */

// DTO ===> DOMAIN
async internalOrderToDomain(dto: InternalOrderDTO): Promise<InternalOrder> {
    return new InternalOrder(
        await this.orderIdToDomain(dto.orderId),
        await Promise.all(dto.items.map(i => this.orderItemDetailToDomain(i))),
        await this.orderStateToDomain(dto.orderState),
        dto.creationDate,
        dto.warehouseDeparture,
        dto.warehouseDestination
    );
}

async sellOrderToDomain(dto: SellOrderDTO): Promise<SellOrder> {
    return new SellOrder(
        await this.orderIdToDomain(dto.orderId),
        await Promise.all(dto.items.map(i => this.orderItemDetailToDomain(i))),
        await this.orderStateToDomain(dto.orderState),
        dto.creationDate,
        dto.warehouseDeparture,
        dto.destinationAddress
    );        
}

async orderItemToDomain(dto: OrderItemDTO): Promise<OrderItem> {
    return new OrderItem(
            new ItemId(dto.itemId.id),
            dto.quantity
        );
}

async orderIdToDomain(dto: OrderIdDTO): Promise<OrderId> {
     return new OrderId(dto.id);
}

async orderStateToDomain(dto: OrderStateDTO): Promise<OrderState> {
    return dto.orderState as OrderState;
}

async orderItemDetailToDomain(dto: OrderItemDetailDTO): Promise<OrderItemDetail> {
    return new OrderItemDetail(
            await this.orderItemToDomain(dto.item),
            dto.quantityReserved,
            dto.unitPrice
    );
}

// DOMAIN ===> DTO

async internalOrderToDTO(entity: InternalOrder): Promise<InternalOrderDTO> {
    return {
        orderId: await this.orderIdToDTO(entity['orderId']),
        items: await Promise.all(
            entity.getItemsDetail().map(d => this.orderItemDetailToDTO(d))
        ),
        orderState: await this.orderStateToDTO(entity.getOrderState()),
        creationDate: entity.getCreationDate(),
        warehouseDeparture: entity.getWarehouseDeparture(),
        warehouseDestination: entity.getWarehouseDestination()
    };
}

async sellOrderToDTO(entity: SellOrder): Promise<SellOrderDTO> {
    return {
        orderId: await this.orderIdToDTO(entity['orderId']),
        items: await Promise.all(
            entity.getItemsDetail().map(d => this.orderItemDetailToDTO(d))
        ),
        orderState: await this.orderStateToDTO(entity.getOrderState()),
        creationDate: entity.getCreationDate(),
        warehouseDeparture: entity.getWarehouseDeparture(),
        destinationAddress: entity.getDestinationAddress()
    };
}

async orderItemToDTO(entity: OrderItem): Promise<OrderItemDTO> {
    return {
        itemId: { id: entity.getItemId() },
        quantity: entity.getQuantity()
    };
}

async orderIdToDTO(entity: OrderId): Promise<OrderIdDTO> {
    return { id: entity.getId() };
}

async orderStateToDTO(state: OrderState): Promise<OrderStateDTO> {
    return { orderState: state };
}

async orderItemDetailToDTO(entity: OrderItemDetail): Promise<OrderItemDetailDTO> {
    return {
        item: await this.orderItemToDTO(entity.getItem()),
        quantityReserved: entity.getQuantityReserved(),
        unitPrice: entity.getUnitPrice()
    };
}

async orderQuantityToDTO(orderId: OrderId, items: OrderItem[]): Promise<OrderQuantityDTO> {
    return {
        id: await this.orderIdToDTO(orderId),
        items: await Promise.all(items.map(i => this.orderItemToDTO(i)))
    };
}

async ordersToDTO(entity: Orders): Promise<OrdersDTO> {
    return {
        sellOrders: await Promise.all(entity.getSellOrders().map(o => this.sellOrderToDTO(o))),
        internalOrders: await Promise.all(entity.getInternalOrders().map(o => this.internalOrderToDTO(o)))
    };
}

}
