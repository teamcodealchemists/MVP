import { RoutingService } from "../../src/application/routing.service";
import { WarehouseId } from "../../src/domain/warehouseId.entity";
import { Test } from "@nestjs/testing";

import { RoutingRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/routing.repository.impl';
import { mock } from "node:test";

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
                }]
        }).compile();
        service = moduleA.get(RoutingService);
    })


    describe("Test per updateWarehouseAddress", () => {

        // it("Dovrebbe restituire true quando l'aggiornamento di un indirizzo di magazzino ha successo", async () => {
        //     const id = new WarehouseId(1);
        //     mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
        //     await expect(service.updateWarehouseAddress(id)).resolves.toBe(true);
        //     expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        // });
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
            // const id = new WarehouseId(1);
            // const state = new (require('../../src/domain/warehouseState.entity').WarehouseState)(id, 'ATTIVO');
            // const address = new (require('../../src/domain/warehouseAddress.entity').WarehouseAddress)(state, 'Via Roma 1, Milano');
            const state = 'ATTIVO';
            const address = 'Via Roma 1, Milano';
            mockRoutingRepository.getAllWarehouses.mockResolvedValueOnce([]);
            //mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            const result = await service.saveWarehouse(state, address);
            expect(!!result).toBe(true);
        });

        it("Dovrebbe restituire false quando il salvataggio di un magazzino fallisce", async () => {
            const state = 'ATTIVO';
            const address = '';
            // const id = new WarehouseId(1);
            // const state = new (require('../../src/domain/warehouseState.entity').WarehouseState)(id, 'ATTIVO');
            // const address = new (require('../../src/domain/warehouseAddress.entity').WarehouseAddress)(state, 'Via Roma 1, Milano');
            mockRoutingRepository.getAllWarehouses.mockResolvedValueOnce([]);
            //mockRoutingRepository.getById.mockResolvedValueOnce(null);
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

});