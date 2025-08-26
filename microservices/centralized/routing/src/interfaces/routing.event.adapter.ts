import { MessagePattern } from '@nestjs/microservices';
import { RoutingService } from 'src/application/routing.service';

import { WarehouseAddress } from 'src/domain/warehouseAddress.entity';



export class RoutingEventAdapter {
    constructor(private readonly routingService: RoutingService) {}

    async sendAddress(warehouseAddress: WarehouseAddress): Promise<void> {
        
    }

    async sendWarehouseAddress(warehouseAddress: WarehouseAddress): Promise<void> {
    
    }


}