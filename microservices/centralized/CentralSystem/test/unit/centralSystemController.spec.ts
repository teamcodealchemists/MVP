import { Test, TestingModule } from '@nestjs/testing';
import { centralSystemController } from 'src/interfaces/centralSystemController';
import { InboundPortsAdapter } from 'src/infrastructure/adapters/InboundPortsAdapter';
import { WarehouseStateDTO } from 'src/interfaces/http/dto/warehouseState.dto';
import { plainToInstance } from 'class-transformer';

describe('centralSystemController', () => {
  let controller: centralSystemController;
  let inboundAdapter: InboundPortsAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [centralSystemController],
      providers: [
        {
          provide: InboundPortsAdapter,
          useValue: {
            handleInsufficientQuantity: jest.fn(),
            handleCriticalQuantityMin: jest.fn(),
            handleCriticalQuantityMax: jest.fn(),
            getWarehouseState: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<centralSystemController>(centralSystemController);
    inboundAdapter = module.get<InboundPortsAdapter>(InboundPortsAdapter);
  });

  describe('handleInsufficientQuantity', () => {
    it('should transform payload and call handleInsufficientQuantity', async () => {
      const payload = {
        orderIdDTO: { id: 'OQ1' },
        itemsDTO: [{ itemId: { id: '1' }, quantity: 5 }],
        warehouseId: 1,
      };

      await controller.handleInsufficientQuantity(payload);

      expect(inboundAdapter.handleInsufficientQuantity).toHaveBeenCalled();
      const mockFn = inboundAdapter.handleInsufficientQuantity as jest.MockedFunction<typeof inboundAdapter.handleInsufficientQuantity>;
      const [orderQuantityDTO, warehouseIdDTO] = mockFn.mock.calls[0];
      expect(orderQuantityDTO.id.id).toBe(payload.orderIdDTO.id);
      expect(orderQuantityDTO.items[0].itemId.id).toBe(payload.itemsDTO[0].itemId.id);
      expect(orderQuantityDTO.items[0].quantity).toBe(payload.itemsDTO[0].quantity);
      expect(warehouseIdDTO.warehouseId).toBe(payload.warehouseId);
    });
  });

  describe('handleCriticalQuantityMin', () => {
    it('should transform payload and call handleCriticalQuantityMin', async () => {
      const payload = {
        product: {
          id: { id: '1' },
          name: 'Prodotto 1',
          quantity: 5,
          minThres: 2,
          maxThres: 10,
          unitPrice: 100,
          warehouseId: { warehouseId: 1 },
        },
      };

      await controller.handleCriticalQuantityMin(payload);

      expect(inboundAdapter.handleCriticalQuantityMin).toHaveBeenCalled();
      const mockFn = inboundAdapter.handleCriticalQuantityMin as jest.MockedFunction<typeof inboundAdapter.handleCriticalQuantityMin>;
      const [productDTO] = mockFn.mock.calls[0];
      expect(productDTO.id.id).toBe(payload.product.id.id);
      expect(productDTO.warehouseId.warehouseId).toBe(payload.product.warehouseId.warehouseId);
    });
  });

  describe('handleCriticalQuantityMax', () => {
    it('should transform payload and call handleCriticalQuantityMax', async () => {
      const payload = {
        product: {
          id: { id: '2' },
          name: 'Prodotto 2',
          quantity: 10,
          minThres: 1,
          maxThres: 20,
          unitPrice: 200,
          warehouseId: { warehouseId: 2 },
        },
      };

      await controller.handleCriticalQuantityMax(payload);

      expect(inboundAdapter.handleCriticalQuantityMax).toHaveBeenCalled();
      const mockFn = inboundAdapter.handleCriticalQuantityMax as jest.MockedFunction<typeof inboundAdapter.handleCriticalQuantityMax>;
      const [productDTO] = mockFn.mock.calls[0];
      expect(productDTO.id.id).toBe(payload.product.id.id);
      expect(productDTO.warehouseId.warehouseId).toBe(payload.product.warehouseId.warehouseId);
    });
  });

  describe('getWarehouseState', () => {
    it('should transform payload and call getWarehouseState', async () => {
      const payload = [
        { state: 'ACTIVE', warehouseId: { id: 1 } },
        { state: 'INACTIVE', warehouseId: { id: 2 } },
      ];

      await controller.getWarehouseState(payload);

      expect(inboundAdapter.getWarehouseState).toHaveBeenCalled();
      const mockFn = inboundAdapter.getWarehouseState as jest.MockedFunction<
        typeof inboundAdapter.getWarehouseState
      >;
      const [warehouseDTOs] = mockFn.mock.calls[0];

      expect(warehouseDTOs.length).toBe(2);
      expect(warehouseDTOs[0]).toBeInstanceOf(WarehouseStateDTO);
      expect(warehouseDTOs[0].state).toBe('ACTIVE');
      expect(warehouseDTOs[1].state).toBe('INACTIVE');
      expect(warehouseDTOs[0].warehouseId.warehouseId).toBe(1);
      expect(warehouseDTOs[1].warehouseId.warehouseId).toBe(2);
    });
  });
});
