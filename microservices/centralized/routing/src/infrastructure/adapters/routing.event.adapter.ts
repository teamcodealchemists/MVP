import { MessagePattern } from '@nestjs/microservices';
import { OutboundService } from 'src/interfaces/outbound.service';

import { WarehouseAddress } from 'src/domain/warehouseAddress.entity';
import { DataMapper } from '../../interfaces/data.mapper';
import { WarehouseAddressDTO } from '../../interfaces/dto/warehouseAddress.dto';
import { WarehouseAddressPublisher } from '../../domain/outbound-ports/warehouseAddress.publisher';
import { AllWarehouseDistancePublisher } from '../../domain/outbound-ports/allWarehouseDistance.publisher';
import { WarehouseIdDTO } from 'src/interfaces/dto/warehouseId.dto';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { domainToUnicode } from 'url';



export class RoutingEventAdapter implements WarehouseAddressPublisher, AllWarehouseDistancePublisher {
    constructor(private readonly outboundService: OutboundService) {}

    sendAddress(warehouseAddress: WarehouseAddress): void {
        const dto: WarehouseAddressDTO = DataMapper.warehouseAddressToDTO(warehouseAddress);
        this.outboundService.sendAddress(dto);
    }

    sendWarehouseDistance(warehouseId: WarehouseId[]): void {
        const dto: WarehouseIdDTO[] = warehouseId.map(id => DataMapper.warehouseIdToDTO(id));
        this.outboundService.sendWarehouseDistance(dto);
    }


}