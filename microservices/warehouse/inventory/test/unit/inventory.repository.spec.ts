import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/inventory.repository.impl';
import { Product } from '../../src/domain/product.entity';
import { ProductId } from '../../src/domain/productId.entity';
import { ProductQuantity } from '../../src/domain/productQuantity.entity';

//prendiamo inventory.repository.spect.ts e mockiamo model di mongo e verifichiamo i metodi che facciano effettivamente quello che devono fare
describe('InventoryRepository : Test sul file src/infrastructure/adapters/mongodb/inventory.repository.impl.ts', () => {
  let repository: InventoryRepositoryMongo;
  let productModel: jest.Mocked<Model<any>>;

 beforeEach(async () => {
    //Andiamo a creare dei mock di metodi statici di Mongoose che la nostra repository usa 
    const mockStaticMethods = {
      findOne: jest.fn(),
      find: jest.fn(),
      deleteOne: jest.fn(),
      updateOne: jest.fn(),
    };
    //Creamo un altro mock dove restituisce oggetto con metodo save(che è presente nell' addProduct dove fa await newProduct.save();, che anche esso è un mock)
    const mockModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({}),
    }));
    //Aggiungiamo i metodi statici mockati direttamente nel costruttore di mockModel
    Object.assign(mockModel, mockStaticMethods);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryRepositoryMongo,
        {
          provide: getModelToken('Product'),
          useValue: mockModel,
        },
      ],
    }).compile();
    //recuperiamo repository reale 
    repository = module.get<InventoryRepositoryMongo>(InventoryRepositoryMongo);
    //recuperiamo il mock del modello
    productModel = module.get(getModelToken('Product'));
  });

  it('addProduct() deve salvare correttamente un nuovo prodotto', async () => {
    //Creo una mock che simula il metodo save() di Mongoose ps) riassunto :Serve solo a intercettare la chiamata a save senza scrivere su MongoDB
    const mockSave = jest.fn().mockResolvedValue({});
    const MockedModel = jest.fn().mockImplementation(() => ({
        save: mockSave,
    }));
    //Creamo un'istanza della repository, e passiamo MockedModel, così quando addProduct() chiama il new this.productModel(), userà il mock e non Mongo
    repository = new InventoryRepositoryMongo(MockedModel as any);
    const product = new Product(new ProductId('p1'), 'Test', 10, 5, 1, 20);
    await repository.addProduct(product);
    expect(MockedModel).toHaveBeenCalledWith({
        id: 'p1',
        name: 'Test',
        unitPrice: 10,
        quantity: 5,
        minThres: 1,
        maxThres: 20,
    });
    expect(mockSave).toHaveBeenCalled();
  });

  it('removeById() deve rimuovere un prodotto esistente e restituire true', async () => {
    productModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    } as any);

    const result = await repository.removeById(new ProductId('p1'));
    expect(result).toBe(true);
  });

  it('updateProduct() deve aggiornare i campi di un prodotto esistente', async () => {
    productModel.updateOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    } as any);

    const product = new Product(new ProductId('p1'), 'Aggiornato', 20, 7, 2, 25);
    await repository.updateProduct(product);
    expect(productModel.updateOne).toHaveBeenCalledWith(
      { id: "p1" },
      expect.objectContaining({ name: 'Aggiornato', unitPrice: 20 }),
    );
  });

  it('getById() deve restituire un prodotto se esiste', async () => {
    productModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        id: 'p1',
        name: 'Test',
        unitPrice: 10,
        quantity: 5,
        minThres: 1,
        maxThres: 20,
      }),
    } as any);

    const product = await repository.getById(new ProductId('p1'));
    expect(product).not.toBeNull();
    if (product) {
        expect(product.getName()).toBe('Test');
    }
  });
});
