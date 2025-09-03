import { Test, TestingModule } from '@nestjs/testing';
import { InboundPortsAdapter } from '../../src/infrastructure/adapters/InboundPortsAdapter';
import { CentralSystemService } from 'src/application/centralsystem.service';
import { DataMapper } from 'src/infrastructure/mappers/dataMapper';
import { OrderQuantityDTO } from 'src/interfaces/http/dto/orderQuantity.dto';
import { productDto } from 'src/interfaces/http/dto/product.dto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
import { WarehouseStateDTO } from 'src/interfaces/http/dto/warehouseStatedto';
import { OrderQuantity } from 'src/domain/orderQuantity.entity';
import { WarehouseState } from 'src/domain/warehouseState.entity';
import { Product } from 'src/domain/product.entity';
import { OrderId } from 'src/domain/orderId.entity';
import { OrderIdDTO } from 'src/interfaces/http/dto/orderId.dto';
import { productIdDto } from 'src/interfaces/http/dto/productId.dto';
import { ProductId } from 'src/domain/productId.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';

describe('InboundPortsAdapter', () => {
  let adapter: InboundPortsAdapter;
  let service: CentralSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboundPortsAdapter,
        {
          provide: CentralSystemService,
          useValue: {
            CheckInsufficientQuantity: jest.fn(),
            ManageCriticalMinThres: jest.fn(),
            ManageOverMaxThres: jest.fn(),
            CheckWarehouseState: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<InboundPortsAdapter>(InboundPortsAdapter);
    service = module.get<CentralSystemService>(CentralSystemService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handleInsufficientQuantity', () => {
    it('should map DTOs to domain and call CheckInsufficientQuantity', async () => {
      const idDto = new OrderIdDTO();
      idDto.id = '1';
      const oQDto: OrderQuantityDTO = { id : idDto, items: [] };
      const warehouseDto: warehouseIdDto = { warehouseId: 1 };
      const idDomains = new OrderId("1");
      const domainOrderQuantity = new OrderQuantity(idDomains, []);
      const domainWarehouseId = { getId: () => 1 };

      jest.spyOn(DataMapper, 'orderQuantityToDomain').mockResolvedValue(domainOrderQuantity);
      jest.spyOn(DataMapper, 'warehouseIdToDomain').mockReturnValue(domainWarehouseId as any);

      await adapter.handleInsufficientQuantity(oQDto, warehouseDto);

      expect(DataMapper.orderQuantityToDomain).toHaveBeenCalledWith(oQDto);
      expect(DataMapper.warehouseIdToDomain).toHaveBeenCalledWith(warehouseDto);
      expect(service.CheckInsufficientQuantity).toHaveBeenCalledWith(domainOrderQuantity, domainWarehouseId);
    });
  });

describe('handleCriticalQuantityMin', () => {
  it('should map DTO to domain and call ManageCriticalMinThres', async () => {
    const warehouseId: warehouseIdDto = { warehouseId: 1 };
    const product: productDto = {
      id: '1',
      quantity: 5,
      minThres: 2,
      maxThres: 10,
      unitPrice: 100,
      warehouseId,
      name: 'Prodotto 1'
    };

    const dProduct = new Product(
      new ProductId('1'),
      'Prodotto 1',
      100,  // unitPrice
      5,    // quantity
      2,    // minThres
      10,   // maxThres
      new WarehouseId(1)
    );

    jest.spyOn(DataMapper, 'toDomainProduct').mockReturnValue(dProduct);

    await adapter.handleCriticalQuantityMin(product);

    expect(DataMapper.toDomainProduct).toHaveBeenCalledWith(product);
    expect(service.ManageCriticalMinThres).toHaveBeenCalledWith(dProduct);
  });
});


  describe('handleCriticalQuantityMax', () => {
    it('should map DTO to domain and call ManageOverMaxThres', async () => {
      const warehouseId: warehouseIdDto = { warehouseId: 1 };
      const product: productDto = { id: '1', quantity: 5, minThres: 2, maxThres: 10, unitPrice: 100, warehouseId: warehouseId, name: 'Prodotto 1' };
      const domainProduct = new Product(new ProductId('1'), 'Prodotto 1', 100, 5, 2, 10, { getId: () => 1 } as any);

      jest.spyOn(DataMapper, 'toDomainProduct').mockReturnValue(domainProduct);

      await adapter.handleCriticalQuantityMax(product);

      expect(DataMapper.toDomainProduct).toHaveBeenCalledWith(product);
      expect(service.ManageOverMaxThres).toHaveBeenCalledWith(domainProduct);
    });
  });

  describe('getWarehouseState', () => {
    it('should map DTOs to domain and call CheckWarehouseState', async () => {
      let wId1 = new warehouseIdDto();
      let wId2 = new warehouseIdDto();
      wId1.warehouseId = 1;
      wId2.warehouseId = 2;
      const dtoArray: WarehouseStateDTO[] = [
        { state: 'ACTIVE' , warehouseId : wId1 },
        { state: 'INACTIVE', warehouseId : wId2 }
      ];
      const domainStates = [
        new WarehouseState('ACTIVE', new WarehouseId(1)),
        new WarehouseState('INACTIVE', new WarehouseId(2))
      ];

      jest.spyOn(DataMapper, 'warehouseStatetoDomain')
        .mockImplementation(dto => domainStates.find(d => d.getId() === dto.warehouseId.warehouseId)!);

      await adapter.getWarehouseState(dtoArray);

      expect(DataMapper.warehouseStatetoDomain).toHaveBeenCalledTimes(dtoArray.length);
      expect(service.CheckWarehouseState).toHaveBeenCalledWith(domainStates);
    });
  });
});
