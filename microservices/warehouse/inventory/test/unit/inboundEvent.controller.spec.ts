import { Test, TestingModule } from '@nestjs/testing';
import { InboundEventController } from '../../src/interfaces/inboundEvent.controller';
import { InboundEventListener } from '../../src/infrastructure/adapters/inbound-event.adapter';
import { ProductQuantityArrayDto } from '../../src/interfaces/dto/productQuantityArray.dto';
import { ProductQuantityDto } from '../../src/interfaces/dto/productQuantity.dto';
import { ProductIdDto } from '../../src/interfaces/dto/productId.dto';
import { OrderIdDTO } from '../../src/interfaces/dto/orderId.dto';
import { ProductId } from 'src/domain/productId.entity';
import { pid } from 'process';

describe('InboundEventController', () => {
  let controller: InboundEventController;
  let listener: jest.Mocked<InboundEventListener>;

  beforeEach(async () => {
    const mockListener: Partial<jest.Mocked<InboundEventListener>> = {
      addQuantity: jest.fn(),
      orderRequest: jest.fn(),
      shipOrderRequest: jest.fn(),
      receiveShipment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InboundEventController],
      providers: [
        { provide: InboundEventListener, useValue: mockListener },
      ],
    }).compile();

    controller = module.get<InboundEventController>(InboundEventController);
    listener = module.get(InboundEventListener) as jest.Mocked<InboundEventListener>;
  });

  it('should handle addQuantity', async () => {
    const pIdDto = new ProductIdDto();
    pIdDto.id = 'p1';
    const payload = JSON.stringify({ id:{id : 'p1'}, quantity: 5 });

    await controller.handleAddQuantity(payload);
    expect(listener.addQuantity).toHaveBeenCalledWith({
      productId: pIdDto,
      quantity: 5,
    } as ProductQuantityDto);
  });

});
