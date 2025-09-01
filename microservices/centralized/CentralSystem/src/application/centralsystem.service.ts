import { Injectable } from "@nestjs/common";
import { Logger } from '@nestjs/common';
// Domain Entities
import { Orders } from "src/domain/orders.entity";
import { Inventory } from "src/domain/inventory.entity";
import { WarehouseState } from "src/domain/warehouseState.entity";
import { OrderQuantity } from "src/domain/orderQuantity.entity";
import { Product } from "src/domain/product.entity";
import { WarehouseId } from "src/domain/warehouseId.entity";

// Outbound Ports
import { OutboundPortsAdapter } from "src/infrastructure/adapters/centralSystemEventAdapter";
import { OrderState } from "src/domain/orderState.enum";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { ItemId } from "src/domain/itemId.entity";
import { OrderId } from "src/domain/orderId.entity";
import { DataMapper } from "src/infrastructure/mappers/dataMapper";
import { ProductId } from "src/domain/productId.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

@Injectable()
export class CentralSystemService {
  constructor(
    private readonly outboundPortsAdapter: OutboundPortsAdapter,
  ) {}
  private readonly logger = new Logger("CentralSystemService");
  // === Metodi applicativi ===
  async RequestAllNeededData(warehouseId : WarehouseId): Promise<{ inv: Inventory; order: Orders; dist: WarehouseState[] }> {
    /*const invDto = await this.outboundPortsAdapter.CloudInventoryRequest();  
    const orderDto = await this.outboundPortsAdapter.CloudOrderRequest();    
    const distDto = await this.outboundPortsAdapter.RequestDistanceWarehouse(warehouseId);
    const inv = DataMapper.toDomainInventory(invDto);
    const order = await DataMapper.ordersToDomain(orderDto); 
    const dist: WarehouseState[] = distDto.map(dto => DataMapper.warehouseStatetoDomain(dto));*/
    // --- Mock prodotti per 3 magazzini, ciascuno con 10 prodotti ---
    // --- Mock prodotti per 3 magazzini, ciascuno con 10 prodotti ---
    const warehouseIds = [new WarehouseId(1), new WarehouseId(2), new WarehouseId(3)];
    const productsPerWarehouse = 5;

    // --- Mock Inventory Products statici ---
    const mockInventoryProducts: Product[] = [];
    warehouseIds.forEach((wh) => {
      for (let i = 1; i <= productsPerWarehouse; i++) {
        mockInventoryProducts.push(
          new Product(
            new ProductId(`1-${i}`),
            `Prodotto $'1-${i}`,
            10 + i,  // prezzo statico
            50 + i,  // quantità disponibile statica
            10,      // minThres
            200,     // maxThres
            wh       // id del magazzino
          )
        );
      }
    });
    const inv = new Inventory(mockInventoryProducts);
    console.log("Questo è inventario: " + JSON.stringify(inv, null, 2));
    // --- Mock SellOrders e InternalOrders statici ---
    const mockSellOrders: SellOrder[] = [];
    const mockInternalOrders: InternalOrder[] = [];

    warehouseIds.forEach((wh) => {
      for (let i = 1; i <= productsPerWarehouse; i++) {
        const sellItem = new OrderItemDetail(
          new OrderItem(new ItemId(Number(`${wh.getId()}-${i}`)), i), // quantità statica
          0,
          10 + i // prezzo unitario statico
        );
        mockSellOrders.push(
          new SellOrder(
            new OrderId(`S-${wh.getId()}-${i}`),
            [sellItem],
            OrderState.PENDING,
            new Date('2025-09-01T12:00:00Z'), // data statica
            wh.getId(),
            `Indirizzo ${wh.getId()}`
          )
        );

        const internalItem = new OrderItemDetail(
          new OrderItem(new ItemId(Number(`${wh.getId()}-${i}`)), i),
          0,
          10 + i
        );
        mockInternalOrders.push(
          new InternalOrder(
            new OrderId(`I-${wh.getId()}-${i}`),
            [internalItem],
            OrderState.PROCESSING,
            new Date('2025-09-01T12:00:00Z'),
            wh.getId(),
            wh.getId()
          )
        );
      }
    });

    const order = new Orders(mockSellOrders, mockInternalOrders);
    console.log("Questo è order: " + JSON.stringify(order, null, 2));
    // --- Mock WarehouseState statici ---
   const dist: WarehouseState[] = warehouseIds
    .filter((wh) => wh.getId() !== warehouseId.getId()) // escludo quello in gioco
    .map((wh) => {
      return new WarehouseState("Good", new WarehouseId(wh.getId())); // esempio statico
    });
    console.log("Questo è dist: " + JSON.stringify(dist, null, 2));
    return { inv, order, dist };
  }

  async CheckRestocking(
    product: Product,
    warehouseId : WarehouseId
  ): Promise<void> {
    const { inv, order, dist } = await this.RequestAllNeededData(warehouseId);
    for (const whState of dist) {
      const whId = whState.getId();
      const productInInv = inv.getInventory().find(
        (p) => p.getId() === product.getId() && p.getIdWarehouse() === whId
      );

      if (!productInInv) continue; 

      const availableQty = productInInv.getQuantity() - product.getQuantity();

      if (availableQty < product.getMinThres()) continue;

      const pendingOrdersInternal = order.getInternalOrders().filter(
      (o) =>
        o.getWarehouseDeparture() === whId &&
        o.getItemsDetail().some((item) => item.getItem().getItemId().toString() === product.getId()) &&
        (o.getOrderState() === OrderState.PENDING|| o.getOrderState() === OrderState.PROCESSING) 
      );
      const pendingOrdersSell = order.getSellOrders().filter(
      (o) =>
        o.getWarehouseDeparture() === whId &&
        o.getItemsDetail().some((item) => item.getItem().getItemId().toString() === product.getId()) &&
        (o.getOrderState() === OrderState.PENDING|| o.getOrderState() === OrderState.PROCESSING)
      );
      const pendingQtyInternal = pendingOrdersInternal.reduce((sum, o) => {
        const qtyInOrderInternal = o.getItemsDetail().reduce((itemSum, item) => itemSum + item.getItem().getQuantity(), 0);
          return sum + qtyInOrderInternal;
        }, 0
      );
      const pendingQtySell = pendingOrdersSell.reduce((sum, o) => {
        const qtyInOrderSell = o.getItemsDetail().reduce((itemSum, item) => itemSum + item.getItem().getQuantity(), 0);
          return sum + qtyInOrderSell;
        }, 0
      );
      const residualQty = availableQty - pendingQtyInternal - pendingQtySell;

      if (residualQty >= product.getMinThres()) {
        //Chiamata per creare un ordine nuovo avendo già i dati del magazzino trovato
        //per ricordare
        let oI = new OrderItem(new ItemId(Number(product.getId())),product.getMinThres()-product.getQuantity());
        let oID = new OrderItemDetail(oI,0,product.getUnitPrice());
        let internalOrders = new InternalOrder(new OrderId(""),[oID],OrderState.PENDING, new Date(), whId,warehouseId.getId());
        console.log("service : Magazzino mandato! \n"+ JSON.stringify(internalOrders, null, 2));
        this.outboundPortsAdapter.createInternalOrder(internalOrders);
        return;
      }
    }
    console.log("Nessun magazzino ha quantità sufficiente per il prodotto");
  }

async CheckInsufficientQuantity(
  orderQuantity: OrderQuantity,
  warehouseId: WarehouseId
): Promise<void> {
  const { inv, order, dist } = await this.RequestAllNeededData(warehouseId);

  const internalOrdersToCreate: InternalOrder[] = []; 
  let productsToAllocate = [...orderQuantity.getItemId()];
  for (const whState of dist) {
    const whId = whState.getId();
    const productsForThisWarehouse: OrderItem[] = [];
    let orderItemsDetails: OrderItemDetail[] = [];
    for (const product of productsToAllocate) {
      const productInInv = inv.getInventory().find(
        (p) => p.getId() === product.getItemId().toString() && p.getIdWarehouse() === whId
      );

      if (!productInInv) continue;

      const availableQty =
        productInInv.getQuantity() - product.getQuantity();

      if (availableQty < productInInv.getMinThres()) continue;

      const pendingOrdersInternal = order
        .getInternalOrders()
        .filter(
          (o) =>
            o.getWarehouseDeparture() === whId &&
            o.getItemsDetail().some(
              (item) =>
                item.getItem().getItemId() === product.getItemId()
            ) &&
            (o.getOrderState() === OrderState.PENDING ||
              o.getOrderState() === OrderState.PROCESSING)
        );

      const pendingOrdersSell = order
        .getSellOrders()
        .filter(
          (o) =>
            o.getWarehouseDeparture() === whId &&
            o.getItemsDetail().some(
              (item) =>
                item.getItem().getItemId() === product.getItemId()
            ) &&
            (o.getOrderState() === OrderState.PENDING ||
              o.getOrderState() === OrderState.PROCESSING)
        );

      const pendingQtyInternal = pendingOrdersInternal.reduce(
        (sum, o) =>
          sum +
          o.getItemsDetail().reduce(
              (itemSum, item) => itemSum + item.getItem().getQuantity(),0
            ),0
      );

      const pendingQtySell = pendingOrdersSell.reduce(
        (sum, o) =>
          sum +
          o.getItemsDetail().reduce(
              (itemSum, item) => itemSum + item.getItem().getQuantity(),0
            ),0
      );

      const residualQty = availableQty - pendingQtyInternal - pendingQtySell;

      if (residualQty >= productInInv.getMinThres()) {
         const oI = new OrderItem(
          new ItemId(product.getItemId()),
          product.getQuantity()
        );
        const oID = new OrderItemDetail(oI, 0, productInInv.getUnitPrice());
        orderItemsDetails.push(oID);
        productsForThisWarehouse.push(product);
      }
    }

    if (orderItemsDetails.length > 0) {
      const internalOrder = new InternalOrder(
        new OrderId(""),
        orderItemsDetails,
        OrderState.PENDING,
        new Date(),
        whId,
        warehouseId.getId()
      );

      internalOrdersToCreate.push(internalOrder);

      productsToAllocate = productsToAllocate.filter(
        (p) => !productsForThisWarehouse.some((fp) => fp.getItemId() === p.getItemId())
      );
    }

    if (productsToAllocate.length === 0) break;
  }

  if (productsToAllocate.length > 0) {
    console.log(
      "Alcuni prodotti non hanno quantità sufficiente nei magazzini:",
      productsToAllocate.map((p) => p.getItemId())
    );
  }else{
    this.logger.log(`Received orderQuantity: ${JSON.stringify(internalOrdersToCreate)}`);
    for (const internalOrder of internalOrdersToCreate) {
      await this.outboundPortsAdapter.createInternalOrder(internalOrder);
    }
    console.log("service : Magazzino mandato! \n"+ JSON.stringify(internalOrdersToCreate, null, 2));
  }
}


  async sendNotification(message: string): Promise<void> {
    await this.outboundPortsAdapter.SendNotification(message);
  }

  async CheckWarehouseState(warehouseState : WarehouseState[]): Promise<void> {
    
  }

  async ManageOverMaxThres(
    product: Product,
    warehouseId : WarehouseId
  ): Promise<void> {
    const { inv, order, dist } = await this.RequestAllNeededData(warehouseId);
    for (const whState of dist) {
      const whId = whState.getId();
      const productInInv = inv.getInventory().find(
        (p) => p.getId() === product.getId() && p.getIdWarehouse() === whId
      );

      if (!productInInv) continue; 

      const availableQty = productInInv.getQuantity() + product.getQuantity();

      if (availableQty > product.getMaxThres()) continue;

      //Controllo se ci sono destinazioni che vengono da me
      const pendingOrdersInternal = order.getInternalOrders().filter(
      (o) =>
        o.getWarehouseDestination() === whId &&
        o.getItemsDetail().some((item) => item.getItem().getItemId().toString() === product.getId()) &&
        (o.getOrderState() === OrderState.PENDING|| o.getOrderState() === OrderState.PROCESSING)
      );
      const pendingQtyInternal = pendingOrdersInternal.reduce((sum, o) => {
        const qtyInOrderInternal = o.getItemsDetail().reduce((itemSum, item) => itemSum + item.getItem().getQuantity(), 0);
          return sum + qtyInOrderInternal;
        }, 0
      );
      const residualQty = availableQty + pendingQtyInternal;

      if (residualQty <= product.getMaxThres()) {
        //Chiamata per creare un ordine nuovo avendo già i dati del magazzino trovato
        //per ricordare
        let oI = new OrderItem(new ItemId(Number(product.getId())),product.getMinThres()-product.getQuantity());
        let oID = new OrderItemDetail(oI,0,product.getUnitPrice());
        let internalOrders = new InternalOrder(new OrderId(""),[oID],OrderState.PENDING, new Date(),warehouseId.getId(),whId);
        console.log("service : Magazzino mandato! \n"+ JSON.stringify(internalOrders, null, 2));
        this.outboundPortsAdapter.createInternalOrder(internalOrders);
        
        return;
      }
    }
    console.log("Nessun magazzino ha disponibilità");
  }
  /*
  async CloudInventoryRequest(): Promise<void> {
    //da implementare
  }
  async CloudOrderRequest(order: Order): Promise<void> {
    //da implementare
  }
  async RequestWarehouseState(id : WarehouseId): Promise<void> {
    //da implementare
  }
  async SendNotification(message : string): Promise<void> {
    //da implementare
  }
  async RequestDistanceWarehouse(warehouseId: WarehouseId): Promise<void> {
    //da implementare
  }
    */
}
