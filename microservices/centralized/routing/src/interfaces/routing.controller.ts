import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RoutingService } from 'src/application/routing.service';

import { WarehouseIdDTO } from './dto/warehouseId.dto';
import { WarehouseAddressDTO } from './dto/warehouseAddress.dto';
import { WarehouseStateDTO } from './dto/warehouseState.dto';
import { DataMapper } from './data.mapper';
import { WarehouseAddressSubscriber } from 'src/domain/inbound-ports/warehouseAddressSubscriber';
import { CriticQuantityEvent } from 'src/domain/inbound-ports/criticQuantity.event';
import { ReceiveWarehouseState } from 'src/domain/inbound-ports/receiveWarehouseState';

@Controller()
export class RoutingController implements WarehouseAddressSubscriber, CriticQuantityEvent, ReceiveWarehouseState {
    constructor(private readonly routingService: RoutingService) {}

    @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.updateAddress`)
    async updateAddress(address: WarehouseAddressDTO): Promise<void> {
        const domainAddress = DataMapper.warehouseAddressToDomain(address);
        this.routingService.updateWarehouseAddress(domainAddress.getId(), domainAddress.getAddress());
    }

    @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.removeAddress`)
    async removeAddress(address: WarehouseAddressDTO): Promise<void> {
        const domainAddress = DataMapper.warehouseAddressToDomain(address);
        this.routingService.removeWarehouseAddress(domainAddress.getWarehouseState().getId());
    }

    @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.addAddress`)
    async addAddress(address: WarehouseAddressDTO): Promise<void> {
        const domainAddress = DataMapper.warehouseAddressToDomain(address);
        this.routingService.saveWarehouseAddress(domainAddress.getId(), domainAddress.getAddress());
    }

    @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.receiveRequest`)
    async receiveRequest(warehouseId: WarehouseIdDTO): Promise<void> {
        const domainId = DataMapper.warehouseIdToDomain(warehouseId);
        await this.routingService.calculateDistance(domainId);
    }

    @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.updateWarehouseState`)
    async updateWarehouseState(warehouseState: WarehouseStateDTO): Promise<void> {
        const domainState = DataMapper.warehouseStateToDomain(warehouseState);
        this.routingService.updateWarehouseState(domainState.getId(), domainState.getState());
    }
}