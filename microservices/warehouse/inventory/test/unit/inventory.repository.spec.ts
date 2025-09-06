import { InventoryRepositoryMongo } from "../../src/infrastructure/adapters/mongodb/inventory.repository.impl";
import { Product } from "src/domain/product.entity";
import { ProductId } from "src/domain/productId.entity";
import { Inventory } from "src/domain/inventory.entity";

describe("InventoryRepositoryMongo", () => {
  let repo: InventoryRepositoryMongo;
  let productModel: any;

  const makeProduct = (
    id: string,
    qty = 10,
    reserved = 0,
    min = 2,
    max = 20
  ) =>
    new Product(new ProductId(id), `Product-${id}`, 100, qty, reserved, min, max);

  beforeEach(() => {
    productModel = {
      save: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
      updateOne: jest.fn(),
      find: jest.fn(),
    };

    // Simula "new this.productModel(...)"
    const productModelConstructor = jest.fn().mockImplementation((values) => ({
      ...values,
      save: productModel.save,
    }));

    Object.assign(productModelConstructor, productModel);

    repo = new InventoryRepositoryMongo(productModelConstructor as any);
  });

  // --------------------------------
  // addProduct
  // --------------------------------
  it("should add a product and call save()", async () => {
    const product = makeProduct("p1");
    await repo.addProduct(product);

    expect(productModel.save).toHaveBeenCalled();
  });

  // --------------------------------
  // removeById
  // --------------------------------
  it("should remove product by id", async () => {
    productModel.deleteOne.mockReturnValue({ exec: () => ({ deletedCount: 1 }) });

    const result = await repo.removeById(new ProductId("p1"));
    expect(result).toBe(true);
    expect(productModel.deleteOne).toHaveBeenCalledWith({ id: "p1" });
  });

  it("should return false if product not found on remove", async () => {
    productModel.deleteOne.mockReturnValue({ exec: () => ({ deletedCount: 0 }) });

    const result = await repo.removeById(new ProductId("p1"));
    expect(result).toBe(false);
  });

  // --------------------------------
  // updateProduct
  // --------------------------------
  it("should update product by id", async () => {
    productModel.updateOne.mockReturnValue({ exec: () => ({ nModified: 1 }) });
    const product = makeProduct("p1", 15);

    await repo.updateProduct(product);

    expect(productModel.updateOne).toHaveBeenCalledWith(
      { id: "p1" },
      expect.objectContaining({
        name: "Product-p1",
        quantity: 15,
      }),
    );
  });

  // --------------------------------
  // getById
  // --------------------------------
  it("should return Product if found", async () => {
    productModel.findOne.mockReturnValue({
      exec: () => ({
        id: "p1",
        name: "Test",
        unitPrice: 100,
        quantity: 5,
        quantityReserved: 2,
        minThres: 1,
        maxThres: 10,
      }),
    });

    const product = await repo.getById(new ProductId("p1"));
    expect(product?.getId()).toBe("p1");
    expect(product?.getQuantity()).toBe(5);
  });

  it("should return null if not found", async () => {
    productModel.findOne.mockReturnValue({ exec: () => null });

    const result = await repo.getById(new ProductId("pX"));
    expect(result).toBeNull();
  });

  // --------------------------------
  // getAllProducts
  // --------------------------------
  it("should return Inventory with all products", async () => {
    productModel.find.mockReturnValue({
      exec: () => [
        {
          id: "p1",
          name: "P1",
          unitPrice: 10,
          quantity: 5,
          quantityReserved: 0,
          minThres: 1,
          maxThres: 20,
        },
        {
          id: "p2",
          name: "P2",
          unitPrice: 15,
          quantity: 8,
          quantityReserved: 1,
          minThres: 2,
          maxThres: 30,
        },
      ],
    });

    const inventory = await repo.getAllProducts();
    expect(inventory).toBeInstanceOf(Inventory);
    expect(inventory.getInventory().length).toBe(2);
    const products = inventory.getInventory();
    expect(products.map(p => p.getId())).toEqual(["p1", "p2"]);
  });
});
