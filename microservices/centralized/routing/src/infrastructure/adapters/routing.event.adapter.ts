import { OutboundService } from 'src/interfaces/outbound.service';

import { WarehouseAddress } from 'src/domain/warehouseAddress.entity';
import { DataMapper } from '../../interfaces/data.mapper';
import { WarehouseAddressDTO } from '../../interfaces/dto/warehouseAddress.dto';
import { WarehouseAddressPublisher } from '../../domain/outbound-ports/warehouseAddress.publisher';



export class RoutingEventAdapter implements WarehouseAddressPublisher {
    constructor(private readonly outboundService: OutboundService) {}

    sendAddress(warehouseAddress: WarehouseAddress): void {
        const dto: WarehouseAddressDTO = DataMapper.warehouseAddressToDTO(warehouseAddress);
        this.outboundService.sendAddress(dto);
    }
}