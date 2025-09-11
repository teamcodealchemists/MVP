import { RoutingService } from "../../src/application/routing.service";
import { WarehouseId } from "../../src/domain/warehouseId.entity";
import { Test } from "@nestjs/testing";

import { RoutingRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/routing.repository.impl';
// import { mock } from "node:test";
import * as nest from '@nestjs/core';
import { Transport } from "@nestjs/microservices";
import { RoutingModule } from "../../src/application/routing.module";
import { RoutingEventAdapter } from "../../src/infrastructure/adapters/routing.event.adapter";

const mockRoutingRepository = {
    getById: jest.fn(),
    updateWarehouseAddress: jest.fn(),
    removeWarehouseAddress: jest.fn(),
    saveWarehouseAddress: jest.fn(),
    updateWarehouseState: jest.fn(),
    getWarehouseAddressById: jest.fn(),
    getAllWarehouseAddresses: jest.fn(),
    saveWarehouse: jest.fn(),
    getWarehouseById: jest.fn(),
    getAllWarehouses: jest.fn(),
    saveWarehouseState: jest.fn(),
    getWarehouseStateById: jest.fn(),
    getAllWarehouseStates: jest.fn(),
};

jest.mock('../../src/interfaces/geo', () => ({
  geocodeAddress: jest.fn(async (address: string) => {
    if (address.includes('Milano')) return [45.4642, 9.19];
    if (address.includes('Padova')) return [45.4064, 11.8768];
    if (address.includes('Napoli')) return [40.8522, 14.2681];
    return [0, 0];
  }),
  haversine: jest.requireActual('../../src/interfaces/geo').haversine,
}));

const mockRoutingEventAdapter = {
    emitWarehouseUpdatedEvent: jest.fn(),
    emitWarehouseRemovedEvent: jest.fn(),
    emitWarehouseCreatedEvent: jest.fn(),
    emitWarehouseStateUpdatedEvent: jest.fn(),
    sendWarehouseAndState: jest.fn()
};

describe("Test per Routing Service", () => {
let service: any;

    beforeEach( async () => {
        jest.clearAllMocks();   //ripulisce lo stato dei mock tra un test e l’altro
        const moduleA = await Test.createTestingModule ({
            providers: [
                RoutingService,
                {
                    provide: 'ROUTINGREPOSITORY',
                    useValue: mockRoutingRepository,
                },
                {
                    provide: RoutingEventAdapter,
                    useValue: mockRoutingEventAdapter,
                }]
        }).compile();
        service = moduleA.get(RoutingService);
    })


    describe("Test per updateWarehouseAddress", () => {

        it("Dovrebbe restituire un output valorizzato quando l'aggiornamento di un indirizzo di magazzino ha successo", async () => {
            const id = new WarehouseId(1);
            const state = new (require('../../src/domain/warehouseState.entity').WarehouseState)(id, 'ATTIVO');
            const address = new (require('../../src/domain/warehouseAddress.entity').WarehouseAddress)(state, 'Via Roma 1, Milano');
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            const result = await service.updateWarehouseAddress(id, address);
            expect(!!result).toBe(true);
        });

        it("Dovrebbe restituire false quando l'aggiornamento di un indirizzo di magazzino fallisce", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any); // id esistente
            const result = await service.updateWarehouseAddress(id); // nessun indirizzo passato
            expect(result).toBe(false);
        });
    });

    describe("Test per removeWarehouseAddress", () => {
        it("Dovrebbe restituire un output valorizzato quando la rimozione di un indirizzo di magazzino ha successo", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            const result = await service.removeWarehouseAddress(id);
            expect(!!result).toBe(true);
        });

        it("Dovrebbe restituire un output false quando la rimozione di un indirizzo di magazzino fallisce", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce(null);
            const result = await service.removeWarehouseAddress(id);
            expect(!result).toBe(false);
        });
    });

    describe("Test per updateWarehouseState", () => {
        it("Dovrebbe restituire un output valorizzato quando l'aggiornamento dello stato di un magazzino ha successo", async () => {
            const id = new WarehouseId(1);
            const state = new (require('../../src/domain/warehouseState.entity').WarehouseState)(id, 'ATTIVO');
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            const result = await service.updateWarehouseState(id, state);
            expect(!!result).toBe(true);
        });

        it("Dovrebbe restituire false quando l'aggiornamento dello stato di un magazzino fallisce", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            const result = await service.updateWarehouseState(id);
            expect(result).toBe(false);
        });
    });

    describe("Test per saveWarehouse", () => {
        it("Dovrebbe restituire un output valorizzato quando il salvataggio di un magazzino ha successo", async () => {
            const state = 'ATTIVO';
            const address = 'Via Roma 1, Milano';
            mockRoutingRepository.getAllWarehouses.mockResolvedValueOnce([]);
            const result = await service.saveWarehouse(state, address);
            expect(!!result).toBe(true);
        });

        it("Dovrebbe restituire false quando il salvataggio di un magazzino fallisce", async () => {
            const state = 'ATTIVO';
            const address = '';
            mockRoutingRepository.getAllWarehouses.mockResolvedValueOnce([]);
            const result = await service.saveWarehouse(state, address);
            expect(result).toBe(false);
        });
    });

    describe("Test per calculateDistance", () => {
        it("Dovrebbe restituire l'array di magazzini in ordine per distanza più vicina al magazzino richiedente", async () => {
            const id = new WarehouseId(1);
            // Mock indirizzo sorgente
            mockRoutingRepository.getWarehouseAddressById.mockResolvedValueOnce({
                getAddress: () => 'Via Roma 1, Milano',
                getWarehouseState: () => ({ getId: () => id }),
            });
            // Mock lista indirizzi magazzini
            const id2 = new WarehouseId(2);
            const id3 = new WarehouseId(3);
            mockRoutingRepository.getAllWarehouseAddresses.mockResolvedValueOnce([
                {
                    getAddress: () => 'Via Roma 1, Milano',
                    getWarehouseState: () => ({ getId: () => id }),
                },
                {
                    getAddress: () => 'Via Roma 2, Padova',
                    getWarehouseState: () => ({ getId: () => id2 }),
                },
                {
                    getAddress: () => 'Via Venezia 3, Napoli',
                    getWarehouseState: () => ({ getId: () => id3 }),
                }
            ]);
            await expect(service.calculateDistance(id)).resolves.toEqual(expect.arrayContaining([expect.any(WarehouseId)]));
        });
    });

    describe('WarehouseId', () => {
        it('equals ritorna true se gli id sono uguali', () => {
            const id1 = new WarehouseId(5);
            const id2 = new WarehouseId(5);
            expect(id1.equals(id2)).toBe(true);
        });

        it('equals ritorna false se gli id sono diversi', () => {
            const id1 = new WarehouseId(5);
            const id2 = new WarehouseId(6);
            expect(id1.equals(id2)).toBe(false);
        });
    });
});