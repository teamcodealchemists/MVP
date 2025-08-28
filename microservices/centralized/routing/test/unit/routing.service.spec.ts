import { RoutingService } from "src/application/routing.service";
import { WarehouseId } from "src/domain/warehouseId.entity";
import { Test } from "@nestjs/testing";

import { RoutingRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/routing.repository.impl';

const mockRoutingRepository = {
    getById: jest.fn(), // mock della funzione getById
    /*
    Esempio: mockRoutingRepository.getById.mockResolvedValueOnce({ id: 'I-012345' });

    */
}


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

        it("Dovrebbe restituire true quando l'aggiornamento di un indirizzo di magazzino ha successo", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            await expect(service.updateWarehouseAddress(id)).resolves.toBe(true);
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });

        it("Dovrebbe restituire false quando l'aggiornamento di un indirizzo di magazzino fallisce", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce(null);
            await expect(service.updateWarehouseAddress(id)).resolves.toBe(false);
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });
    });

    describe("Test per removeWarehouseAddress", () => {
        it("Dovrebbe restituire true quando la rimozione di un indirizzo di magazzino ha successo", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            await expect(service.removeWarehouseAddress(id)).resolves.toBe(true);
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });

        it("Dovrebbe restituire false quando la rimozione di un indirizzo di magazzino fallisce", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce(null);
            await expect(service.removeWarehouseAddress(id)).resolves.toBe(false);
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });
    });

    describe("Test per saveWarehouseAddress", () => {
        it("Dovrebbe restituire true quando il salvataggio di un indirizzo di magazzino ha successo", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            await expect(service.saveWarehouseAddress(id)).resolves.toBe(true);
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });

        it("Dovrebbe restituire false quando il salvataggio di un indirizzo di magazzino fallisce", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce(null);
            await expect(service.saveWarehouseAddress(id)).resolves.toBe(false);
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });
    });

    describe("Test per updateWarehouseState", () => {
        it("Dovrebbe restituire true quando l'aggiornamento dello stato di un magazzino ha successo", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            await expect(service.updateWarehouseState(id)).resolves.toBe(true);
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });

        it("Dovrebbe restituire false quando l'aggiornamento dello stato di un magazzino fallisce", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce(null);
            await expect(service.updateWarehouseState(id)).resolves.toBe(false);
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });
    });

    describe("Test per calculateDistance", () => {
        it("Dovrebbe restituire l'array di magazzini in ordine per distanza più vicina al magazzino richiedente", async () => {
            const id = new WarehouseId(1);
            mockRoutingRepository.getById.mockResolvedValueOnce({} as any);
            await expect(service.calculateDistance(id)).resolves.toEqual(expect.arrayContaining([expect.any(WarehouseId)]));
            expect(mockRoutingRepository.getById).toHaveBeenCalledWith(id);
        });
    });

});