import 'reflect-metadata';
import { StockRemovedDTO } from '../../src/interfaces/dto/stockRemoved.dto';
import { SyncEventDTO } from '../../src/interfaces/dto/syncEvent.dto';
import { SyncInventoryDTO } from '../../src/interfaces/dto/syncInventory.dto';
import { SyncProductDTO } from '../../src/interfaces/dto/syncProduct.dto';
import { SyncProductIdDTO } from '../../src/interfaces/dto/syncProductId.dto';
import { SyncWarehouseIdDTO } from '../../src/interfaces/dto/syncWarehouseId.dto';

describe('DTOs', () => {
    describe('StockRemovedDTO', () => {
        it('should create an instance with correct properties', () => {
            const dto = new StockRemovedDTO();
            dto.id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
            dto.warehouseId = 'wh-1';
            dto.quantity = 5;

            expect(dto.id).toBe('a1b2c3d4-e5f6-7890-1234-567890abcdef');
            expect(dto.warehouseId).toBe('wh-1');
            expect(dto.quantity).toBe(5);
        });
    });

    describe('SyncEventDTO', () => {
        it('should create an instance with correct properties', () => {
            const timestamp = new Date().toISOString();
            const dto = new SyncEventDTO();
            dto.id = 'b1c2d3e4-f5g6-7890-1234-567890abcdef';
            dto.name = 'Product Name';
            dto.unitPrice = 99.99;
            dto.quantity = 100;
            dto.minThres = 10;
            dto.maxThres = 200;
            dto.eventType = 'PRODUCT_UPDATED';
            dto.timestamp = timestamp;
            dto.source = 'inventory-service';
            dto.warehouseId = 1;

            expect(dto.id).toBe('b1c2d3e4-f5g6-7890-1234-567890abcdef');
            expect(dto.name).toBe('Product Name');
            expect(dto.unitPrice).toBe(99.99);
            expect(dto.quantity).toBe(100);
            expect(dto.minThres).toBe(10);
            expect(dto.maxThres).toBe(200);
            expect(dto.eventType).toBe('PRODUCT_UPDATED');
            expect(dto.timestamp).toBe(timestamp);
            expect(dto.source).toBe('inventory-service');
            expect(dto.warehouseId).toBe(1);
        });
    });

    describe('SyncInventoryDTO', () => {
        it('should create an instance with correct properties', () => {
            const dto = new SyncInventoryDTO();
            dto.productList = [];

            expect(dto.productList).toEqual([]);
        });
    });

    describe('SyncProductDTO', () => {
        it('should create an instance with correct properties', () => {
            const productIdDto = new SyncProductIdDTO();
            productIdDto.id = 'prod-3';

            const warehouseIdDto = new SyncWarehouseIdDTO();
            warehouseIdDto.warehouseId = 3;

            const dto = new SyncProductDTO();
            dto.id = productIdDto;
            dto.name = 'Product Name';
            dto.unitPrice = 50.0;
            dto.quantity = 20;
            dto.quantityReserved = 5;
            dto.minThres = 5;
            dto.maxThres = 50;
            dto.warehouseId = warehouseIdDto;

            expect(dto.id).toEqual(productIdDto);
            expect(dto.name).toBe('Product Name');
            expect(dto.unitPrice).toBe(50.0);
            expect(dto.quantity).toBe(20);
            expect(dto.quantityReserved).toBe(5);
            expect(dto.minThres).toBe(5);
            expect(dto.maxThres).toBe(50);
            expect(dto.warehouseId).toEqual(warehouseIdDto);
        });
    });

    describe('SyncProductIdDTO', () => {
        it('should create an instance with correct properties', () => {
            const dto = new SyncProductIdDTO();
            dto.id = 'prod-4';

            expect(dto.id).toBe('prod-4');
        });
    });

    describe('SyncWarehouseIdDTO', () => {
        it('should create an instance with correct properties', () => {
            const dto = new SyncWarehouseIdDTO();
            dto.warehouseId = 5;

            expect(dto.warehouseId).toBe(5);
        });
    });
});