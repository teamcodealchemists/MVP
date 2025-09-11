import { OrdersRepositoryMongo } from "src/infrastructure/adapters/mongodb/orders.repository.impl";
import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrderState } from "src/domain/orderState.enum";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { ItemId } from "src/domain/itemId.entity";
import { Orders } from "src/domain/orders.entity";
import { Logger } from "@nestjs/common";


jest.mock("src/infrastructure/adapters/mongodb/model/internalOrder.model");
jest.mock("src/infrastructure/adapters/mongodb/model/sellOrder.model");
jest.mock("src/infrastructure/adapters/mongodb/model/orderItemDetail.model");
jest.mock("src/infrastructure/mappers/data.mapper");

describe("OrdersRepositoryMongo", () => {
  let repo: OrdersRepositoryMongo;
  let internalOrderModel: any;
  let sellOrderModel: any;
  let orderItemDetailModel: any;
  let mapper: any;
  
beforeEach(() => {
  // Crea costruttori mockati
  const MockInternalOrderModel = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(undefined)
  }));

  const MockSellOrderModel = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(undefined)
  }));

  // Aggiungi i metodi statici ai costruttori mockati
  Object.assign(MockInternalOrderModel, {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    bulkWrite: jest.fn(),
    create: jest.fn()
  });

  Object.assign(MockSellOrderModel, {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    bulkWrite: jest.fn(),
    create: jest.fn()
  });

  internalOrderModel = MockInternalOrderModel;
  sellOrderModel = MockSellOrderModel;

  orderItemDetailModel = {};
  mapper = {
    internalOrderToDomain: jest.fn(),
    sellOrderToDomain: jest.fn(),
  };

  repo = new OrdersRepositoryMongo(
    internalOrderModel as any,
    sellOrderModel as any,
    orderItemDetailModel,
    mapper
  );

  // SALVA I RIFERIMENTI AI COSTRUTTORI MOCKATI
  (repo as any)._internalOrderConstructorMock = MockInternalOrderModel;
  (repo as any)._sellOrderConstructorMock = MockSellOrderModel;

});


  describe("getById", () => {
    it("should return InternalOrder if found", async () => {
      const orderId = new OrderId("I123");
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "I123" },
            items: [{
              item: { itemId: { id: 1 }, quantity: 5 },
              quantityReserved: 5,
              unitPrice: 10
            }],
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            warehouseDestination: 2,
            sellOrderReference: { id: "S456" }
          })
        })
      });

      const result = await repo.getById(orderId);
      expect(result).toBeInstanceOf(InternalOrder);
      expect(result.getOrderId()).toBe("I123");
    });

    it("should return SellOrder if InternalOrder not found", async () => {
      const orderId = new OrderId("S123");
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "S123" },
            items: [{
              item: { itemId: { id: 1 }, quantity: 5 },
              quantityReserved: 5,
              unitPrice: 10
            }],
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: "Via Roma"
          })
        })
      });

      const result = await repo.getById(orderId);
      expect(result).toBeInstanceOf(SellOrder);
      expect(result.getOrderId()).toBe("S123");
    });

    it("should throw if not found", async () => {
      const orderId = new OrderId("X999");
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });

      await expect(repo.getById(orderId)).rejects.toThrow();
    });

    it("should handle errors when searching for order", async () => {
      const orderId = new OrderId("I123");
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Database error"))
        })
      });

      await expect(repo.getById(orderId)).rejects.toThrow("Database error");
    });

    it("should handle and log errors", async () => {
      const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation();
      
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Database error"))
        })
      });

      await expect(repo.getById(new OrderId("I123"))).rejects.toThrow("Database error");
      expect(loggerSpy).toHaveBeenCalled();
      
      loggerSpy.mockRestore();
    });
    
    it("should log errors in getById", async () => {
      const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation();
      
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Database error"))
        })
      });

      await expect(repo.getById(new OrderId("I123"))).rejects.toThrow();
      expect(loggerSpy).toHaveBeenCalled();
      
      loggerSpy.mockRestore();
    });
  });

  describe("getState", () => {
    it("should return state for InternalOrder", async () => {
      const orderId = new OrderId("I123");
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({ orderState: OrderState.PENDING })
        })
      });

      const state = await repo.getState(orderId);
      expect(state).toBe(OrderState.PENDING);
    });

    it("should return state for SellOrder", async () => {
      const orderId = new OrderId("S123");
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({ orderState: OrderState.COMPLETED })
        })
      });

      const state = await repo.getState(orderId);
      expect(state).toBe(OrderState.COMPLETED);
    });

    it("should throw if not found", async () => {
      const orderId = new OrderId("X999");
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });

      await expect(repo.getState(orderId)).rejects.toThrow();
    });

    it("should handle database errors", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Database error"))
        })
      });
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Database error"))
        })
      });

      await expect(repo.getState(new OrderId("I123"))).rejects.toThrow("Database error");
    });

  });

  describe("getAllOrders", () => {
    it("should return all orders", async () => {
      internalOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve([
            {
              orderId: { id: "I123" },
              items: [],
              orderState: OrderState.PENDING,
              creationDate: new Date(),
              warehouseDeparture: 1,
              warehouseDestination: 2,
              sellOrderReference: { id: "S456" }
            }
          ])
        })
      });
      sellOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve([
            {
              orderId: { id: "S123" },
              items: [],
              orderState: OrderState.PENDING,
              creationDate: new Date(),
              warehouseDeparture: 1,
              destinationAddress: "Via Roma"
            }
          ])
        })
      });

      const orders = await repo.getAllOrders();
      expect(orders).toBeInstanceOf(Orders);
      expect(orders.getInternalOrders().length).toBe(1);
      expect(orders.getSellOrders().length).toBe(1);
    });

    it("should handle errors when fetching internal orders", async () => {
      internalOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Internal orders error"))
        })
      });

      await expect(repo.getAllOrders()).rejects.toThrow();
    });

    it("should handle errors when fetching sell orders", async () => {
      internalOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve([])
        })
      });
      
      sellOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Sell orders error"))
        })
      });

      await expect(repo.getAllOrders()).rejects.toThrow();
    });
  
    it("should handle conversion errors for internal orders", async () => {
      internalOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve([
            {
              orderId: { id: "I123" },
              items: "invalid-items-structure", // Questo causerà un errore di conversione
              orderState: OrderState.PENDING,
              creationDate: new Date(),
              warehouseDeparture: 1,
              warehouseDestination: 2,
              sellOrderReference: { id: "S456" }
            }
          ])
        })
      });
      sellOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve([])
        })
      });

      await expect(repo.getAllOrders()).rejects.toThrow("Errore conversione internalDoc");
    });

    it("should handle conversion errors for sell orders", async () => {
      internalOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve([])
        })
      });
      sellOrderModel.find.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve([
            {
              orderId: { id: "S123" },
              items: "invalid-items-structure", // Questo causerà un errore di conversione
              orderState: OrderState.PENDING,
              creationDate: new Date(),
              warehouseDeparture: 1,
              destinationAddress: "Via Roma"
            }
          ])
        })
      });

      await expect(repo.getAllOrders()).rejects.toThrow("Errore conversione sellDoc");
    });

    it("should handle null items in internal orders", async () => {
    internalOrderModel.find.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve([
          {
            orderId: { id: "I123" },
            items: null, // Items null
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            warehouseDestination: 2,
            sellOrderReference: { id: "S456" }
          }
        ])
      })
    });
    sellOrderModel.find.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve([])
      })
    });

    await expect(repo.getAllOrders()).rejects.toThrow();
  });

  it("should handle undefined items in sell orders", async () => {
    internalOrderModel.find.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve([])
      })
    });
    sellOrderModel.find.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve([
          {
            orderId: { id: "S123" },
            items: undefined, // Items undefined
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: "Via Roma"
          }
        ])
      })
    });

    await expect(repo.getAllOrders()).rejects.toThrow();
  });
  });


  describe("addSellOrder", () => {
    it("should save a sell order", async () => {
        const sellOrder = new SellOrder(
        new OrderId("S123"),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        "Via Roma"
        );

    await repo.addSellOrder(sellOrder);
    expect(sellOrderModel).toHaveBeenCalled(); // Verifica che il costruttore sia chiamato
    });

    it("should handle save errors", async () => {
    const sellOrder = new SellOrder(
      new OrderId("S123"),
      [],
      OrderState.PENDING,
      new Date(),
      1,
      "Via Roma"
    );

    // Mock per far fallire il save
    const mockInstance = { 
      save: jest.fn().mockRejectedValue(new Error("Save error")) 
    };
    (repo as any)._sellOrderConstructorMock.mockReturnValue(mockInstance);

    await expect(repo.addSellOrder(sellOrder)).rejects.toThrow("Save error");
  });

  it("should handle validation errors in addSellOrder", async () => {
      const sellOrder = new SellOrder(
        new OrderId(""), // ID vuoto - potrebbe causare errore
        [],
        OrderState.PENDING,
        new Date(),
        1,
        "Via Roma"
      );

      // Mock per far fallire la validazione
      const mockInstance = { 
        save: jest.fn().mockRejectedValue(new Error("Validation error")) 
      };
      (repo as any)._sellOrderConstructorMock.mockReturnValue(mockInstance);

      await expect(repo.addSellOrder(sellOrder)).rejects.toThrow("Validation error");
    });

});

  describe("addInternalOrder", () => {
    it("should save an internal order", async () => {
        const internalOrder = new InternalOrder(
        new OrderId("I123"),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId("S456")
        );

        await repo.addInternalOrder(internalOrder);
        expect(internalOrderModel).toHaveBeenCalled(); // Verifica che il costruttore sia chiamato
    });

    it("should handle save errors", async () => {
    const internalOrder = new InternalOrder(
      new OrderId("I123"),
      [],
      OrderState.PENDING,
      new Date(),
      1,
      2,
      new OrderId("S456")
    );

    // Mock per far fallire il save
    const mockInstance = { 
      save: jest.fn().mockRejectedValue(new Error("Save error")) 
    };
    (repo as any)._internalOrderConstructorMock.mockReturnValue(mockInstance);

    await expect(repo.addInternalOrder(internalOrder)).rejects.toThrow("Save error");
  });

});

  describe("removeById", () => {
    it("should throw if order is COMPLETED", async () => {
      const orderId = new OrderId("I123");
      repo.getState = jest.fn().mockResolvedValue(OrderState.COMPLETED);

      await expect(repo.removeById(orderId)).rejects.toThrow();
    });

    it("should return false if order is CANCELED", async () => {
      const orderId = new OrderId("I123");
      repo.getState = jest.fn().mockResolvedValue(OrderState.CANCELED);

      const result = await repo.removeById(orderId);
      expect(result).toBe(false);
    });

    it("should return true if order is canceled successfully", async () => {
      const orderId = new OrderId("I123");
      repo.getState = jest.fn().mockResolvedValue(OrderState.PENDING);
      repo.updateOrderState = jest.fn().mockResolvedValue({
        getOrderState: () => OrderState.CANCELED
      });

      const result = await repo.removeById(orderId);
      expect(result).toBe(true);
    });

    it("should handle errors in getState", async () => {
      repo.getState = jest.fn().mockRejectedValue(new Error("State error"));
      
      await expect(repo.removeById(new OrderId("I123"))).rejects.toThrow("State error");
    });

    it("should handle errors in updateOrderState", async () => {
      repo.getState = jest.fn().mockResolvedValue(OrderState.PENDING);
      repo.updateOrderState = jest.fn().mockRejectedValue(new Error("Update error"));
      
      await expect(repo.removeById(new OrderId("I123"))).rejects.toThrow("Update error");
    });

    it("should return false if updateOrderState doesn't return CANCELED", async () => {
      const orderId = new OrderId("I123");
      repo.getState = jest.fn().mockResolvedValue(OrderState.PENDING);
      repo.updateOrderState = jest.fn().mockResolvedValue({
        getOrderState: () => OrderState.PENDING // Non CANCELED
      });

      const result = await repo.removeById(orderId);
      expect(result).toBe(false);
    });
  });

  describe("updateOrderState", () => {
    it("should update state for InternalOrder", async () => {
      const orderId = new OrderId("I123");
      internalOrderModel.findOneAndUpdate.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "I123" },
            items: [],
            orderState: OrderState.COMPLETED,
            creationDate: new Date(),
            warehouseDeparture: 1,
            warehouseDestination: 2,
            sellOrderReference: { id: "S456" }
          })
        })
      });

      const result = await repo.updateOrderState(orderId, OrderState.COMPLETED);
      expect(result).toBeInstanceOf(InternalOrder);
      expect(result.getOrderState()).toBe(OrderState.COMPLETED);
    });

    it("should update state for SellOrder", async () => {
      const orderId = new OrderId("S123");
      internalOrderModel.findOneAndUpdate.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      sellOrderModel.findOneAndUpdate.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "S123" },
            items: [],
            orderState: OrderState.COMPLETED,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: "Via Roma"
          })
        })
      });

      const result = await repo.updateOrderState(orderId, OrderState.COMPLETED);
      expect(result).toBeInstanceOf(SellOrder);
      expect(result.getOrderState()).toBe(OrderState.COMPLETED);
    });

    it("should throw if not found", async () => {
      const orderId = new OrderId("X999");
      internalOrderModel.findOneAndUpdate.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      sellOrderModel.findOneAndUpdate.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });

      await expect(repo.updateOrderState(orderId, OrderState.COMPLETED)).rejects.toThrow();
    });

    it("should handle update errors", async () => {
      const orderId = new OrderId("I123");
      internalOrderModel.findOneAndUpdate.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Update error"))
        })
      });

      await expect(repo.updateOrderState(orderId, OrderState.COMPLETED))
        .rejects.toThrow("Update error");
    });
  });

  describe("genUniqueId", () => {
    it("should generate a unique InternalOrder ID", async () => {
      repo.getById = jest.fn().mockRejectedValue(new Error("not found"));
      const id = await repo.genUniqueId("I");
      expect(id.getId()).toMatch(/^I[0-9a-fA-F\-]{36}$/);
    });

    it("should generate a unique SellOrder ID", async () => {
      repo.getById = jest.fn().mockRejectedValue(new Error("not found"));
      const id = await repo.genUniqueId("S");
      expect(id.getId()).toMatch(/^S[0-9a-fA-F\-]{36}$/);
    });

    it("should handle errors during ID generation", async () => {
      // Mock per far fallire la verifica
      repo.getById = jest.fn().mockImplementation(() => {
        throw new Error("Verification error");
      });

      // Mock di console.log per evitare output durante il test
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Il metodo dovrebbe comunque restituire un ID perché cattura l'errore
      const result = await repo.genUniqueId("I");
      
      // Verifica che sia stato generato un ID valido
      expect(result.getId()).toMatch(/^I[0-9a-fA-F\-]{36}$/);
      
      // Verifica che getById sia stato chiamato
      expect(repo.getById).toHaveBeenCalled();
      
      // Ripristina i mock
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("should retry if ID already exists", async () => {
      let callCount = 0;
      repo.getById = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({});
        throw new Error("not found");
      });
      const id = await repo.genUniqueId("I");
      expect(id.getId()).toMatch(/^I[0-9a-fA-F\-]{36}$/);
      expect(callCount).toBeGreaterThan(1);
    });

    it("should handle errors in outer try block", async () => {
      // Mock per far fallire la creazione di OrderId (blocco esterno)
      const originalOrderId = OrderId;
      (global as any).OrderId = jest.fn().mockImplementation(() => {
        throw new Error("Invalid ID format");
      });

      await expect(repo.genUniqueId("I")).rejects.toThrow("Errore durante la verifica dell'ID");

      // Ripristina il costruttore originale
      (global as any).OrderId = originalOrderId;
    });

    it("should handle case where getById returns an actual order (ID exists)", async () => {
      // Mock per far sì che getById restituisca un ordine (ID già esistente)
      repo.getById = jest.fn().mockResolvedValue({
        getOrderId: () => "Iexisting123"
      });

      // Mock di console per evitare output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Dovrebbe rigenerare un nuovo ID
      const result = await repo.genUniqueId("I");
      
      expect(result.getId()).toMatch(/^I[0-9a-fA-F\-]{36}$/);
      expect(repo.getById).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("should handle errors in OrderId constructor", async () => {
      // Salva il costruttore originale
      const originalOrderId = OrderId;
      
      // Mock per far fallire il costruttore OrderId
      (global as any).OrderId = jest.fn().mockImplementation(() => {
        throw new Error("Invalid ID format");
      });

      await expect(repo.genUniqueId("I")).rejects.toThrow("Errore durante la verifica dell'ID");

      // Ripristina il costruttore originale
      (global as any).OrderId = originalOrderId;
    });
  });

  describe("updateReservedStock", () => {
    it("should update reserved stock for InternalOrder", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({ orderId: { id: "I123" }, items: [], orderState: OrderState.PENDING, creationDate: new Date(), warehouseDeparture: 1, warehouseDestination: 2, sellOrderReference: { id: "S456" } })
        })
      });
      internalOrderModel.bulkWrite.mockResolvedValue(undefined);
      internalOrderModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: () => Promise.resolve({ orderId: { id: "I123" }, items: [], orderState: OrderState.PENDING, creationDate: new Date(), warehouseDeparture: 1, warehouseDestination: 2, sellOrderReference: { id: "S456" } })
        })
      });
      mapper.internalOrderToDomain.mockResolvedValue(new InternalOrder(new OrderId("I123"), [], OrderState.PENDING, new Date(), 1, 2, new OrderId("S456")));

      const items = [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ];
      const result = await repo.updateReservedStock(new OrderId("I123"), items);
      expect(result).toBeInstanceOf(InternalOrder);
      expect(mapper.internalOrderToDomain).toHaveBeenCalled();
    });

    it("should update reserved stock for SellOrder", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      sellOrderModel.bulkWrite.mockResolvedValue(undefined);
      sellOrderModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: () => Promise.resolve({ orderId: { id: "S123" }, items: [], orderState: OrderState.PENDING, creationDate: new Date(), warehouseDeparture: 1, destinationAddress: "Via Roma" })
        })
      });
      mapper.sellOrderToDomain.mockResolvedValue(new SellOrder(new OrderId("S123"), [], OrderState.PENDING, new Date(), 1, "Via Roma"));

      const items = [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ];
      const result = await repo.updateReservedStock(new OrderId("S123"), items);
      expect(result).toBeInstanceOf(SellOrder);
      expect(mapper.sellOrderToDomain).toHaveBeenCalled();
    });

    it("should throw if order not found after update", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      const items = [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ];
      await expect(repo.updateReservedStock(new OrderId("X999"), items)).rejects.toThrow();
    });

    it("should handle errors during bulkWrite", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({ 
            orderId: { id: "I123" }, 
            items: [], 
            orderState: OrderState.PENDING, 
            creationDate: new Date(), 
            warehouseDeparture: 1, 
            warehouseDestination: 2, 
            sellOrderReference: { id: "S456" } 
          })
        })
      });
      
      internalOrderModel.bulkWrite.mockRejectedValue(new Error("Bulk write error"));

      const items = [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ];
      
      await expect(repo.updateReservedStock(new OrderId("I123"), items))
        .rejects.toThrow("Impossibile trovare l'ordine con ID I123");
    });

    it("should handle mapper errors", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({ 
            orderId: { id: "I123" }, 
            items: [], 
            orderState: OrderState.PENDING, 
            creationDate: new Date(), 
            warehouseDeparture: 1, 
            warehouseDestination: 2, 
            sellOrderReference: { id: "S456" } 
          })
        })
      });
      
      internalOrderModel.bulkWrite.mockResolvedValue(undefined);
      internalOrderModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: () => Promise.resolve({ 
            orderId: { id: "I123" }, 
            items: [], 
            orderState: OrderState.PENDING, 
            creationDate: new Date(), 
            warehouseDeparture: 1, 
            warehouseDestination: 2, 
            sellOrderReference: { id: "S456" } 
          })
        })
      });
      
      mapper.internalOrderToDomain.mockRejectedValue(new Error("Mapper error"));

      const items = [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ];
    
      await expect(repo.updateReservedStock(new OrderId("I123"), items))
        .rejects.toThrow("Impossibile trovare l'ordine con ID I123");
    });

    
    it("should handle errors when finding order type", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Find error"))
        })
      });
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Find error"))
        })
      });

      const items = [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ];
      
      await expect(repo.updateReservedStock(new OrderId("I123"), items))
        .rejects.toThrow("Impossibile trovare l'ordine con ID I123");
    });

    it("should handle missing orderState in InternalOrder", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({ 
            orderId: { id: "I123" }, 
            items: [], 
            orderState: null, // orderState mancante
            creationDate: new Date(), 
            warehouseDeparture: 1, 
            warehouseDestination: 2, 
            sellOrderReference: { id: "S456" } 
          })
        })
      });
      
      internalOrderModel.bulkWrite.mockResolvedValue(undefined);
      internalOrderModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: () => Promise.resolve({ 
            orderId: { id: "I123" }, 
            items: [], 
            orderState: null, // orderState mancante
            creationDate: new Date(), 
            warehouseDeparture: 1, 
            warehouseDestination: 2, 
            sellOrderReference: { id: "S456" } 
          })
        })
      });

      const items = [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ];
      
      await expect(repo.updateReservedStock(new OrderId("I123"), items))
        .rejects.toThrow("Stato ordine non valido");
    });

    it("should handle empty items array in updateReservedStock", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({ 
            orderId: { id: "I123" }, 
            items: [], 
            orderState: OrderState.PENDING, 
            creationDate: new Date(), 
            warehouseDeparture: 1, 
            warehouseDestination: 2, 
            sellOrderReference: { id: "S456" } 
          })
        })
      });
      
      // Items array vuoto
      const items: OrderItemDetail[] = [];
      
      const result = await repo.updateReservedStock(new OrderId("I123"), items);
      expect(result).toBeInstanceOf(InternalOrder);
    });
  });

  describe("checkReservedQuantityForSellOrder", () => {
    it("should not throw if all items are fully reserved", async () => {
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "S123" },
            items: [
              { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 5, unitPrice: 10 }
            ],
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: "Via Roma"
          })
        })
      });
      const sellOrder = new SellOrder(new OrderId("S123"), [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ], OrderState.PENDING, new Date(), 1, "Via Roma");
      await expect(repo.checkReservedQuantityForSellOrder(sellOrder)).resolves.not.toThrow();
    });

    it("should throw if any item is not fully reserved", async () => {
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "S123" },
            items: [
              { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 3, unitPrice: 10 }
            ],
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: "Via Roma"
          })
        })
      });
      const sellOrder = new SellOrder(new OrderId("S123"), [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)
      ], OrderState.PENDING, new Date(), 1, "Via Roma");
      await expect(repo.checkReservedQuantityForSellOrder(sellOrder)).rejects.toThrow("Quantità riservata insufficiente per alcuni items");
    });

    it("should throw if SellOrder not found", async () => {
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      const sellOrder = new SellOrder(new OrderId("S999"), [], OrderState.PENDING, new Date(), 1, "Via Roma");
      await expect(repo.checkReservedQuantityForSellOrder(sellOrder)).rejects.toThrow();
    });

    it("should handle database errors", async () => {
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Database error"))
        })
      });
      
      const sellOrder = new SellOrder(
        new OrderId("S123"),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        "Via Roma"
      );
      
      await expect(repo.checkReservedQuantityForSellOrder(sellOrder))
        .rejects.toThrow("Database error");
    });

    it("should handle conversion errors", async () => {
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "S123" },
            items: "invalid-structure", // Questo causerà un errore di conversione
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: "Via Roma"
          })
        })
      });

      const sellOrder = new SellOrder(
        new OrderId("S123"),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        "Via Roma"
      );

      await expect(repo.checkReservedQuantityForSellOrder(sellOrder))
        .rejects.toThrow();
    });

    it("should handle invalid items structure in SellOrder", async () => {
      sellOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "S123" },
            items: "completely-invalid-structure", // Struttura completamente invalida
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            destinationAddress: "Via Roma"
          })
        })
      });

      const sellOrder = new SellOrder(
        new OrderId("S123"),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        "Via Roma"
      );

      await expect(repo.checkReservedQuantityForSellOrder(sellOrder))
        .rejects.toThrow();
    });
  });

  describe("checkReservedQuantityForInternalOrder", () => {
    it("should not throw if all items are fully reserved", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "I123" },
            items: [
              { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 5, unitPrice: 10 }
            ],
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            warehouseDestination: 2,
            sellOrderReference: { id: "S456" }
          })
        })
      });
      const internalOrder = new InternalOrder(new OrderId("I123"), [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)
      ], OrderState.PENDING, new Date(), 1, 2, new OrderId("S456"));
      await expect(repo.checkReservedQuantityForInternalOrder(internalOrder)).resolves.not.toThrow();
    });

    it("should throw if any item is not fully reserved", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "I123" },
            items: [
              { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 3, unitPrice: 10 }
            ],
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            warehouseDestination: 2,
            sellOrderReference: { id: "S456" }
          })
        })
      });
      const internalOrder = new InternalOrder(new OrderId("I123"), [
        new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)
      ], OrderState.PENDING, new Date(), 1, 2, new OrderId("S456"));
      await expect(repo.checkReservedQuantityForInternalOrder(internalOrder)).rejects.toThrow("Quantità riservata insufficiente per alcuni items");
    });

    it("should throw if InternalOrder not found", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null)
        })
      });
      const internalOrder = new InternalOrder(new OrderId("I999"), [], OrderState.PENDING, new Date(), 1, 2, new OrderId("S456"));
      await expect(repo.checkReservedQuantityForInternalOrder(internalOrder)).rejects.toThrow();
    });

    it("should handle database errors", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.reject(new Error("Database error"))
        })
      });
      
      const internalOrder = new InternalOrder(
        new OrderId("I123"),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId("S456")
      );
      
      await expect(repo.checkReservedQuantityForInternalOrder(internalOrder))
        .rejects.toThrow("Database error");
    });

    it("should handle conversion errors", async () => {
      internalOrderModel.findOne.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve({
            orderId: { id: "I123" },
            items: "invalid-structure", // Questo causerà un errore di conversione
            orderState: OrderState.PENDING,
            creationDate: new Date(),
            warehouseDeparture: 1,
            warehouseDestination: 2,
            sellOrderReference: { id: "S456" }
          })
        })
      });

      const internalOrder = new InternalOrder(
        new OrderId("I123"),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId("S456")
      );

      await expect(repo.checkReservedQuantityForInternalOrder(internalOrder))
        .rejects.toThrow();
    });
  });
});