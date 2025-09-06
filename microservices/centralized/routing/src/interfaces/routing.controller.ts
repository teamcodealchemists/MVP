import { Controller, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoutingService } from 'src/application/routing.service';

import { WarehouseIdDTO } from './dto/warehouseId.dto';
import { WarehouseAddressDTO } from './dto/warehouseAddress.dto';
import { WarehouseStateDTO } from './dto/warehouseState.dto';
import { DataMapper } from './data.mapper';
import { WarehouseAddressSubscriber } from 'src/domain/inbound-ports/warehouseAddressSubscriber';
import { CriticQuantityEvent } from 'src/domain/inbound-ports/criticQuantity.event';
import { ReceiveWarehouseState } from 'src/domain/inbound-ports/receiveWarehouseState';
import { WarehouseSubscriber } from 'src/domain/inbound-ports/warehouseSubscriber';
import { WarehouseAddress } from 'src/domain/warehouseAddress.entity';
import { WarehouseState } from 'src/domain/warehouseState.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';

@Controller()
export class RoutingController implements WarehouseAddressSubscriber, CriticQuantityEvent, ReceiveWarehouseState, WarehouseSubscriber {
    constructor(private readonly routingService: RoutingService) {}

    @MessagePattern(`call.routing.warehouse.${process.env.WAREHOUSE_ID}.address.set`)
    async updateAddress(@Payload('params') address: WarehouseAddressDTO): Promise<string|false> {
        try{
            const domainAddress = DataMapper.warehouseAddressToDomain(address);
            return await this.routingService.updateWarehouseAddress(domainAddress.getId(), domainAddress.getAddress());
        } catch (error) {
            return Promise.resolve(JSON.stringify({
                        error: {
                            code: "system.invalidParams",
                            message: error.message
                        }
                    }));
        }
    }

    @MessagePattern(`call.routing.warehouse.${process.env.WAREHOUSE_ID}.address.delete`)
    async removeAddress(@Payload('params') address: WarehouseAddressDTO): Promise<string> {
        try {
            const domainAddress = DataMapper.warehouseAddressToDomain(address);
            return await this.routingService.removeWarehouseAddress(domainAddress.getWarehouseState().getId());
        } catch (error) {
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.invalidParams",
                    message: error.message
                }
            }));
        }
    }

    @MessagePattern(`call.routing.warehouse.${process.env.WAREHOUSE_ID}.receiveRequest.set`)
    async receiveRequest(@Payload('params') warehouseId: WarehouseIdDTO): Promise<string> {
        try {
            const domainId = DataMapper.warehouseIdToDomain(warehouseId);
            const warehouses = await this.routingService.calculateDistance(domainId);
            return Promise.resolve(JSON.stringify({ result: "Request received successfully", warehouses: warehouses }));
        } catch (error) {
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.invalidParams",
                    message: error.message
                }
            }));
        }
    }

    @MessagePattern(`call.routing.warehouse.${process.env.WAREHOUSE_ID}.warehouseState.add`)
    async updateWarehouseState(@Payload('params') warehouseState: WarehouseStateDTO): Promise<string|false> {
        try {
            const domainState = DataMapper.warehouseStateToDomain(warehouseState);
            return await this.routingService.updateWarehouseState(domainState.getId(), domainState.getState());
        } catch (error) {
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.invalidParams",
                    message: error.message
                }
            }));
        }
    }


    @MessagePattern('call.routing.warehouse.create')
    async createWarehouse(@Payload('params') dto: { state: string, address: string }): Promise<string|false> {
        try {
            return await this.routingService.saveWarehouse(dto.state, dto.address);
        } catch (error) {
            return Promise.resolve(JSON.stringify({
            error: {
                code: "system.invalidParams",
                message: error.message
            }
            }));
        }
    }

}