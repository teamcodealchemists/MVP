import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RoutingService } from 'src/application/routing.service';

import { WarehouseIdDTO } from './dto/warehouseId.dto';
import { WarehouseAddressDTO } from './dto/warehouseAddress.dto';
import { WarehouseStateDTO } from './dto/warehouseState.dto';

@Controller()
export class RoutingController {
    constructor(private readonly routingService: RoutingService) {}

    @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getHello`)

    updateAddress(address: WarehouseAddressDTO): void {
    }

    removeAddress(address: WarehouseAddressDTO): void {
    }

    addAddress(address: WarehouseAddressDTO): void {
    }

    receiveRequest(warehouseId: WarehouseIdDTO): void {
    }

    updateWarehouseState(warehouseState: WarehouseStateDTO): void {
    }
}