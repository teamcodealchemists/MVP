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


export class DataMapper {

// DTO ===> DOMAIN

async internalOrderToDomain(orderDTO: InternalOrderDTO): Promise<InternalOrder> {
  // Validazione: Non si può partire e arrivare allo stesso magazzino
  if (orderDTO.warehouseDeparture === orderDTO.warehouseDestination) {
    throw new Error(`Il magazzino di partenza (${orderDTO.warehouseDeparture}) non può essere uguale alla destinazione`);
  }

  return new InternalOrder(
    await this.orderIdToDomain(orderDTO.orderId), 
    await Promise.all(orderDTO.items.map(i => this.orderItemDetailToDomain(i))), 
    await this.orderStateToDomain(orderDTO.orderState),
    orderDTO.creationDate,
    orderDTO.warehouseDeparture,
    orderDTO.warehouseDestination
  );
}

async sellOrderToDomain(orderDTO: SellOrderDTO): Promise<SellOrder> {
  return new SellOrder(
    await this.orderIdToDomain(orderDTO.orderId),
    await Promise.all(orderDTO.items.map(i => this.orderItemDetailToDomain(i))),
    await this.orderStateToDomain(orderDTO.orderState),
    orderDTO.creationDate,
    orderDTO.warehouseDeparture,
    orderDTO.destinationAddress
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
  const state = dto.orderState;
  
  if (!Object.values(OrderState).includes(state as OrderState)) {
    throw new Error(`Stato ordine non valido: ${state}. Stati validi: ${Object.values(OrderState).join(', ')}`);
  }
  return state as OrderState;
}

async orderItemDetailToDomain(dto: OrderItemDetailDTO): Promise<OrderItemDetail> {
  // quantityReserved NON può esser maggiore della quantity totale ordinata
  if (dto.quantityReserved > dto.item.quantity) {
    throw new Error(`Quantità riservata (${dto.quantityReserved}) maggiore della quantità ordinata (${dto.item.quantity})`);
  }

  return new OrderItemDetail(
    await this.orderItemToDomain(dto.item),
    dto.quantityReserved,
    dto.unitPrice
  );
}

// DOMAIN ===> DTO

async internalOrderToDTO(entity: InternalOrder): Promise<InternalOrderDTO> {

    const internalOrderDTO: InternalOrderDTO = {
        orderId: await this.orderIdToDTO(entity['orderId']),
        items: await Promise.all(
            entity.getItemsDetail().map(d => this.orderItemDetailToDTO(d))
        ),
        orderState: await this.orderStateToDTO(entity.getOrderState()),
        creationDate: entity.getCreationDate(),
        warehouseDeparture: entity.getWarehouseDeparture(),
        warehouseDestination: entity.getWarehouseDestination()
    };

    return internalOrderDTO;
}

async sellOrderToDTO(entity: SellOrder): Promise<SellOrderDTO> {
    const sellOrderDTO: SellOrderDTO = {
        orderId: await this.orderIdToDTO(entity['orderId']),
        items: await Promise.all(
            entity.getItemsDetail().map(d => this.orderItemDetailToDTO(d))
        ),
        orderState: await this.orderStateToDTO(entity.getOrderState()),
        creationDate: entity.getCreationDate(),
        warehouseDeparture: entity.getWarehouseDeparture(),
        destinationAddress: entity.getDestinationAddress()
    };

    return sellOrderDTO;
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

/* async ordersToDTO(orders: Orders): Promise<OrdersDTO> {
    try {
        console.log('Conversione Orders a DTO...');
        
        const sellOrdersDTO = await Promise.all(
            orders.getSellOrders().map(async (order, index) => {
                try {
                    const dto = await this.sellOrderToDTO(order);
                    console.log(`SellOrder ${index + 1} convertito a DTO`);
                    return dto;
                } catch (error) {
                    console.error(`Errore conversione SellOrder ${index} a DTO:`, error);
                    throw error;
                }
            })
        );

        const internalOrdersDTO = await Promise.all(
            orders.getInternalOrders().map(async (order, index) => {
                try {
                    const dto = await this.internalOrderToDTO(order);
                    console.log(`InternalOrder ${index + 1} convertito a DTO`);
                    return dto;
                } catch (error) {
                    console.error(`Errore conversione InternalOrder ${index} a DTO:`, error);
                    throw error;
                }
            })
        );

        console.log('Conversione Orders a DTO completata');
        return {
            sellOrders: sellOrdersDTO,
            internalOrders: internalOrdersDTO
        };
        
    } catch (error) {
        console.error('Errore in ordersToDTO:', error);
        throw error;
    }
}
 */

async ordersToDTO(orders: Orders): Promise<OrdersDTO> {
    try {
        // Conversione SellOrder a SellOrderDTO
        const sellOrders = await Promise.all(
            orders.getSellOrders().map(async (order, index) => {
                try {
                    const result = await this.sellOrderToDTO(order);
                    console.log(`SellOrder ${index + 1} convertito a DTO`);
                    return result;
                } catch (error) {
                    console.error(`Errore conversione SellOrder ${index} a DTO:`, error);
                    throw error;
                }
            })
        );
        // Conversione InternalOrder a InternalOrderDTO
        const internalOrders = await Promise.all(
            orders.getInternalOrders().map(async (order, index) => {
                try {
                    const result = await this.internalOrderToDTO(order);
                    console.log(`InternalOrder ${index + 1} convertito a DTO`);
                    return result;
                } catch (error) {
                    console.error(`Errore conversione InternalOrder ${index} a DTO:`, error);
                    throw error;
                }
            })
        );

        console.log('Conversione Orders a DTO completata');
        return {
            sellOrders: sellOrders,
            internalOrders: internalOrders
        };
        
    } catch (error) {
        console.error('Errore in ordersToDTO:', error);
        throw error;
    }
}

}
