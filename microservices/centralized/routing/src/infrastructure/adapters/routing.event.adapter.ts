import { OutboundService } from '../../interfaces/outbound.service';
import { Injectable } from '@nestjs/common';

import { WarehouseAddress } from '../../domain/warehouseAddress.entity';
import { DataMapper } from '../../interfaces/data.mapper';
import { WarehouseAddressDTO } from '../../interfaces/dto/warehouseAddress.dto';
import { WarehouseAddressPublisher } from '../../domain/outbound-ports/warehouseAddress.publisher';
import { WarehouseStateDTO } from '../../interfaces/dto/warehouseState.dto';
import { WarehouseIdDTO } from '../../interfaces/dto/warehouseId.dto';


@Injectable()
export class RoutingEventAdapter implements WarehouseAddressPublisher {
    constructor(private readonly outboundService: OutboundService) {}

    sendAddress(warehouseAddress: WarehouseAddress): void {
        const dto: WarehouseAddressDTO = DataMapper.warehouseAddressToDTO(warehouseAddress);
        this.outboundService.sendAddress(dto);
    }

    sendWarehouseAndState(warehouseId: WarehouseIdDTO, state: 'ONLINE' | 'OFFLINE'): void {
        const dto: WarehouseStateDTO = { warehouseId, state: state };
        this.outboundService.sendWarehouseAndState(dto);
    }
}