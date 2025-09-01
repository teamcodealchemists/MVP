import { Injectable } from "@nestjs/common";

// Ports Interfaces
import { OrderPublisher } from "src/domain/outbound-ports/orderPublisher";
import { RequestCloudInventoryPublisher } from "src/domain/outbound-ports/requestCloudInventoryPublisher";
import { RequestCloudOrdersPublisher } from "src/domain/outbound-ports/requestCloudOrdersPublisher";
import { WarehouseRoutingPublisher } from "src/domain/outbound-ports/warehouseRoutingPublisher";
import { WarehouseStatePublisher } from "src/domain/outbound-ports/warehouseStatePublisher";
import { NotificationPublisher } from "src/domain/outbound-ports/notificationPublisher";
import { centralSystemHandler } from "src/interfaces/centralSystem.handler";

// Domain
import { InternalOrder } from "src/domain/internalOrder.entity";
import { Inventory } from "src/domain/inventory.entity";
import { Orders } from "src/domain/orders.entity";
import { WarehouseId } from "src/domain/warehouseId.entity";
import { WarehouseState } from "src/domain/warehouseState.entity";

// DTO
import { DataMapper } from "src/infrastructure/mappers/dataMapper";
import { inventoryDto } from "src/interfaces/http/dto/inventory.dto";
import { OrdersDTO } from "src/interfaces/http/dto/orders.dto";
import { WarehouseStateDTO } from "src/interfaces/http/dto/warehouseState.dto";
import { InternalOrderDTO } from "src/interfaces/http/dto/internalOrder.dto";

@Injectable()
export class OutboundPortsAdapter implements 
OrderPublisher,
RequestCloudInventoryPublisher,
RequestCloudOrdersPublisher,
WarehouseRoutingPublisher,
WarehouseStatePublisher,
NotificationPublisher
{   
    constructor(private readonly centralSystemHandler: centralSystemHandler) {}

    async SendNotification(notification: string): Promise<void> {
        await this.centralSystemHandler.handleNotification(notification);
    }

    async createInternalOrder(order: InternalOrder): Promise<void> {
        const dto: InternalOrderDTO = await DataMapper.internalOrderToDTO(order);
        console.log("adapter : Magazzino mandato! \n"+ dto);
        await this.centralSystemHandler.handleOrder(dto);
    }

    async CloudInventoryRequest(): Promise<inventoryDto> {
        const domainInventory: Inventory = await this.centralSystemHandler.handleCloudInventoryRequest();
        return DataMapper.toDtoInventory(domainInventory);
    }

    async CloudOrderRequest(): Promise<OrdersDTO> {
        const domainOrders: Orders = await this.centralSystemHandler.handleCloudOrdersRequest();
        return DataMapper.ordersToDTO(domainOrders);
    }

    async RequestDistanceWarehouse(warehouseId: WarehouseId): Promise<WarehouseStateDTO[]> {
        const dtoId = DataMapper.warehouseIdToDto(warehouseId);
        const warehouseStatesDomain: WarehouseState[] = await this.centralSystemHandler.handleWarehouseDistance(dtoId);
        const warehouseStatesDTO: WarehouseStateDTO[] = warehouseStatesDomain.map(ws => DataMapper.warehouseStatetoDto(ws));
        return warehouseStatesDTO;
    }

    async RequestWarehouseState(id: WarehouseId): Promise<void> {
        const dtoId = DataMapper.warehouseIdToDto(id);
        await this.centralSystemHandler.handleWarehouseState(dtoId);
    }
}
