import { Controller, Post } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { RoutingService } from '../../src/application/routing.service';

import { WarehouseIdDTO } from './dto/warehouseId.dto';
import { WarehouseAddressDTO } from './dto/warehouseAddress.dto';
import { WarehouseStateDTO } from './dto/warehouseState.dto';
import { DataMapper } from './data.mapper';
import { WarehouseAddressSubscriber } from './../domain/inbound-ports/warehouseAddressSubscriber';
import { CriticQuantityEvent } from './../domain/inbound-ports/criticQuantity.event';
import { ReceiveWarehouseState } from './../domain/inbound-ports/receiveWarehouseState';
import { WarehouseSubscriber } from './../domain/inbound-ports/warehouseSubscriber';
import { WarehouseAddress } from './../domain/warehouseAddress.entity';
import { WarehouseState } from './../domain/warehouseState.entity';
import { WarehouseId } from './../domain/warehouseId.entity';

@Controller()
export class RoutingController implements WarehouseAddressSubscriber, CriticQuantityEvent, ReceiveWarehouseState, WarehouseSubscriber {
    constructor(private readonly routingService: RoutingService) {}

    @MessagePattern(`call.routing.warehouse.*.address.set`)
    async updateAddress(@Payload('params') address: WarehouseAddressDTO, @Ctx() context: any): Promise<string|false> {
        try{
            const warehouseId = context.getSubject().split('.')[3];
            const domainAddress = DataMapper.warehouseAddressToDomain(address);
            return await this.routingService.updateWarehouseAddress(new WarehouseId(Number(warehouseId)), domainAddress.getAddress());
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

    @MessagePattern(`call.routing.warehouse.*.receiveRequest.set`)
    async receiveRequest(@Payload() payload: any): Promise<string> {
        console.log('Received payload in receiveRequest:', payload);
        try {
            const warehouseId = new WarehouseIdDTO()
            warehouseId.warehouseId = payload.warehouseId;
            const domainId = DataMapper.warehouseIdToDomain(warehouseId);
            console.log('Payload received in receiveRequest:', domainId);
            const warehouses = await this.routingService.calculateDistance(domainId);
            console.log('Received warehouseId:', warehouseId);
            console.log('DomainId:', domainId);
            console.log('Calculated warehouses:', warehouses);
            return Promise.resolve(JSON.stringify({ result: { warehouses } }));
        } catch (error) {
            return Promise.resolve(JSON.stringify({
                error: {
                    code: "system.invalidParams",
                    message: error.message
                }
            }));
        }
    }

    @MessagePattern(`call.routing.warehouse.*.warehouseState.set`)
    async updateWarehouseState(@Payload() payload: any): Promise<string|false> {
        console.log('Received warehouseState DTO:', payload);
        try {
            const domainState = DataMapper.warehouseStateToDomain(payload);
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