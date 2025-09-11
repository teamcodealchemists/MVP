//ROUTING CONTROLLER TESTS
import { RoutingController } from '../../src/interfaces/routing.controller';
import { RoutingService } from '../../src/application/routing.service';
import { DataMapper } from '../../src/interfaces/data.mapper';
import { WarehouseAddressDTO } from '../../src/interfaces/dto/warehouseAddress.dto';
import { WarehouseStateDTO } from '../../src/interfaces/dto/warehouseState.dto';
import { WarehouseIdDTO } from '../../src/interfaces/dto/warehouseId.dto';

jest.mock('../../src/interfaces/data.mapper', () => ({
    DataMapper: {
        warehouseAddressToDomain: jest.fn(),
        warehouseIdToDomain: jest.fn(),
        warehouseStateToDomain: jest.fn(),
    }
}));

describe('RoutingController', () => {
  let routingService: RoutingService;
  let controller: RoutingController;

  beforeEach(() => {
    routingService = {
      updateWarehouseAddress: jest.fn().mockResolvedValue('ok'),
      removeWarehouseAddress: jest.fn().mockResolvedValue('removed'),
      calculateDistance: jest.fn().mockResolvedValue([1, 2, 3]),
      updateWarehouseState: jest.fn().mockResolvedValue('updated'),
      saveWarehouse: jest.fn().mockResolvedValue('created'),
    } as any;
    controller = new RoutingController(routingService);
  });

  it('updateAddress chiama il service e ritorna il risultato', async () => {
    (DataMapper.warehouseAddressToDomain as jest.Mock).mockReturnValue({
      getId: () => 1,
      getAddress: () => 'Via Roma 1'
    });
    const dto: WarehouseAddressDTO = { warehouseState: { warehouseId: { warehouseId: 1 }, state: 'ATTIVO' }, address: 'Via Roma 1' };
    const result = await controller.updateAddress(dto);
    expect(routingService.updateWarehouseAddress).toHaveBeenCalledWith(1, 'Via Roma 1');
    expect(result).toBe('ok');
  });

  it('updateAddress gestisce errori', async () => {
    (DataMapper.warehouseAddressToDomain as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    const dto: WarehouseAddressDTO = { warehouseState: { warehouseId: { warehouseId: 1 }, state: 'ATTIVO' }, address: 'Via Roma 1' };
    const result = await controller.updateAddress(dto);
    expect(JSON.parse(result as string).error.code).toBe('system.invalidParams');
  });

  it('removeAddress chiama il service e ritorna il risultato', async () => {
    (DataMapper.warehouseAddressToDomain as jest.Mock).mockReturnValue({
      getWarehouseState: () => ({ getId: () => 2 })
    });
    const dto: WarehouseAddressDTO = { warehouseState: { warehouseId: { warehouseId: 2 }, state: 'DISATTIVO' }, address: 'Via Milano 2' };
    const result = await controller.removeAddress(dto);
    expect(routingService.removeWarehouseAddress).toHaveBeenCalledWith(2);
    expect(result).toBe('removed');
  });

  it('removeAddress gestisce errori', async () => {
    (DataMapper.warehouseAddressToDomain as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    const dto: WarehouseAddressDTO = { warehouseState: { warehouseId: { warehouseId: 2 }, state: 'DISATTIVO' }, address: 'Via Milano 2' };
    const result = await controller.removeAddress(dto);
    expect(JSON.parse(result as string).error.code).toBe('system.invalidParams');
  });

  it('receiveRequest chiama il service e ritorna la risposta', async () => {
    (DataMapper.warehouseIdToDomain as jest.Mock).mockReturnValue(3);
    const dto: WarehouseIdDTO = { warehouseId: 3 };
    const result = await controller.receiveRequest(dto);
    expect(routingService.calculateDistance).toHaveBeenCalledWith(3);
    expect(JSON.parse(result as string).warehouses).toEqual([1, 2, 3]);
  });

  it('receiveRequest gestisce errori', async () => {
    (DataMapper.warehouseIdToDomain as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    const dto: WarehouseIdDTO = { warehouseId: 3 };
    const result = await controller.receiveRequest(dto);
    expect(JSON.parse(result as string).error.code).toBe('system.invalidParams');
  });

  it('updateWarehouseState chiama il service e ritorna il risultato', async () => {
    (DataMapper.warehouseStateToDomain as jest.Mock).mockReturnValue({
      getId: () => 4,
      getState: () => 'ATTIVO'
    });
    const dto: WarehouseStateDTO = { warehouseId: { warehouseId: 4 }, state: 'ATTIVO' };
    const result = await controller.updateWarehouseState(dto);
    expect(routingService.updateWarehouseState).toHaveBeenCalledWith(4, 'ATTIVO');
    expect(result).toBe('updated');
  });

  it('updateWarehouseState gestisce errori', async () => {
    (DataMapper.warehouseStateToDomain as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    const dto: WarehouseStateDTO = { warehouseId: { warehouseId: 4 }, state: 'ATTIVO' };
    const result = await controller.updateWarehouseState(dto);
    expect(JSON.parse(result as string).error.code).toBe('system.invalidParams');
  });

  it('createWarehouse chiama il service e ritorna il risultato', async () => {
    const dto = { state: 'ATTIVO', address: 'Via Roma 5' };
    const result = await controller.createWarehouse(dto);
    expect(routingService.saveWarehouse).toHaveBeenCalledWith('ATTIVO', 'Via Roma 5');
    expect(result).toBe('created');
  });

  it('createWarehouse gestisce errori', async () => {
    routingService.saveWarehouse = jest.fn().mockImplementation(() => { throw new Error('fail'); });
    const dto = { state: 'ATTIVO', address: 'Via Roma 5' };
    const result = await controller.createWarehouse(dto);
    expect(JSON.parse(result as string).error.code).toBe('system.invalidParams');
  });
});