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
import { SellOrder } from "src/domain/sellOrder.entity";
import { ProductId } from "src/domain/productId.entity";
import { Order } from "src/domain/order.entity";

@Injectable()
export class CentralSystemService {
  constructor(
    private readonly outboundPortsAdapter: OutboundPortsAdapter,
  ) {}
  private readonly logger = new Logger("CentralSystemService");
  // === Metodi applicativi ===
  async RequestAllNeededData(warehouseId : WarehouseId): Promise<{ inv: Inventory; order: Orders | null; dist: WarehouseId[]}> {

    const invDto = await this.outboundPortsAdapter.CloudInventoryRequest();     
    const inv = DataMapper.toDomainInventory(invDto);
    console.log("Inventario:", JSON.stringify(inv, null, 2));

    const distDto = await this.outboundPortsAdapter.RequestDistanceWarehouse(warehouseId);
    const dist: WarehouseId[] = distDto.map(dto => DataMapper.warehouseIdToDomain(dto));
    console.log("Stato magazzini:", JSON.stringify(dist, null, 2));
    
    const orderDto = await this.outboundPortsAdapter.CloudOrderRequest();  
    if(orderDto === null){
        return Promise.resolve({ inv, order: null, dist });
    }  
    const order = await DataMapper.ordersToDomain(orderDto); 
    console.log("Ordini:", JSON.stringify(order, null, 2));  
    return Promise.resolve({ inv, order, dist });
    /*
    // --- Mock Inventory Products statici ---
    const warehouseIds: WarehouseId[] = [
      new WarehouseId(2),
    ];
    const productsPerWarehouse = 1;
    const mockInventoryProducts: Product[] = [];
    warehouseIds.forEach((wh) => {
      for (let i = 1; i <= productsPerWarehouse; i++) {
        mockInventoryProducts.push(
          new Product(
            new ProductId(`${i}`),
            `Prodotto $'1-${i}`,
            10 + i,  // prezzo statico
            25,  // quantità disponibile statica
            10,      // minThres
            200,     // maxThres
            wh     // id del magazzino
          )
        );
      }
    });
    const inv = new Inventory(mockInventoryProducts);
    //console.log("Questo è inventario: " + JSON.stringify(inv, null, 2));
    // --- Mock SellOrders e InternalOrders statici ---
    const mockSellOrders: SellOrder[] = [];
    const mockInternalOrders: InternalOrder[] = [];

    warehouseIds.forEach((wh) => {
      for (let i = 1; i <= productsPerWarehouse; i++) {
        const sellItem = new OrderItemDetail(
          new OrderItem(new ItemId(i), 6), // quantità statica
          0,
          10 + i // prezzo unitario statico
        );
        mockSellOrders.push(
          new SellOrder(
            new OrderId(`S-${i}`),
            [sellItem],
            OrderState.PENDING,
            new Date('2025-09-01T12:00:00Z'), // data statica
            wh.getId(),
            `Indirizzo ${wh.getId()}`
          )
        );

        const internalItem = new OrderItemDetail(
          new OrderItem(new ItemId(i), i+4),
          0,
          10 + i
        );
        mockInternalOrders.push(
          new InternalOrder(
            new OrderId(`I-${i}`),
            [internalItem],
            OrderState.PROCESSING,
            new Date('2025-09-01T12:00:00Z'),
            wh.getId(),
            wh.getId()
          )
        );
      }
    });

    const order = new Orders(mockInternalOrders,mockSellOrders);
    //console.log("Questo è order: " + JSON.stringify(order, null, 2));
    // --- Mock WarehouseState statici ---
   const dist: WarehouseState[] = warehouseIds
    .filter((wh) => wh.getId() !== warehouseId.getId()) // escludo quello in gioco
    .map((wh) => {
      return new WarehouseState("Good", new WarehouseId(wh.getId())); // esempio statico
    });
    //console.log("Questo è dist: " + JSON.stringify(dist, null, 2));
    return Promise.resolve({ inv, order, dist }); */
  }

  async ManageCriticalMinThres(
    product: Product,
  ): Promise<void> {
    console.log("ManageCriticalMinThres called with product:", JSON.stringify(product, null, 2));
    const warehouseId = new WarehouseId(product.getIdWarehouse());
    const { inv, order, dist } = await this.RequestAllNeededData(warehouseId);
    for (const whState of dist) {
      const whId = whState.getId();
      const productInInv = inv.getInventory().find(
        (p) => p.getId() === product.getId() && p.getIdWarehouse() === whId
      );
      //console.log(JSON.stringify(inv, null, 2));
      
      if (!productInInv){
        continue;
      } 

      const availableQty = productInInv.getQuantity() - product.getQuantity();
      if (availableQty < productInInv.getMinThres()){
        /*
        console.log("Magazzino" + whId);
        console.log("availableQty" + availableQty);
        console.log("productInInv.getQuantity()" + productInInv.getQuantity());
        console.log("product.getMinThres()" + productInInv.getMinThres());
        */
        continue;
      } 
      if(order !== null){
        const pendingOrdersInternal = order.getInternalOrders().filter(
        (o) =>
          o.getWarehouseDeparture() === whId &&
          o.getItemsDetail().some((item) => item.getItem().getItemId().toString() === product.getId()) &&
          (o.getOrderState() === OrderState.PENDING|| o.getOrderState() === OrderState.PROCESSING) 
        );
        
        //console.log(JSON.stringify(order.getSellOrders(), null, 2));
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

        if (residualQty >= productInInv.getMinThres()) {
          //Chiamata per creare un ordine nuovo avendo già i dati del magazzino trovato
          //per ricordare
          let oI = new OrderItem(new ItemId(Number(product.getId())),product.getMinThres()-product.getQuantity());
          let oID = new OrderItemDetail(oI,0,product.getUnitPrice());
          let internalOrders = new InternalOrder(new OrderId(""),[oID],OrderState.PENDING, new Date(), whId,warehouseId.getId());
          //console.log("service : Magazzino mandato! \n"+ JSON.stringify(internalOrders, null, 2));
          this.outboundPortsAdapter.createInternalOrder(internalOrders, new OrderId(""));
        }else{
          let oI = new OrderItem(new ItemId(Number(product.getId())),product.getMinThres()-product.getQuantity());
          let oID = new OrderItemDetail(oI,0,product.getUnitPrice());
          let internalOrders = new InternalOrder(new OrderId(""),[oID],OrderState.PENDING, new Date(), whId,warehouseId.getId());
          //console.log("service : Magazzino mandato! \n"+ JSON.stringify(internalOrders, null, 2));
          this.outboundPortsAdapter.createInternalOrder(internalOrders, new OrderId(""));
          return Promise.resolve();
        }
      }else {
        //console.log("Magazzino : "+whId+"\nresidualQty >= product.getMinThres()\n availableQty : " + availableQty + "\n pendingQtyInternal : "+ pendingQtyInternal + "\n pendingQtySell : "+ pendingQtySell + "\n residualQty : "+ residualQty);
      }
    }
    this.outboundPortsAdapter.sendInventory("MIN - Non disponibile", new ProductId(product.getId()), new WarehouseId(product.getIdWarehouse()));
    return Promise.resolve()
  }

async CheckInsufficientQuantity(
  orderQuantity: OrderQuantity,
  warehouseId: WarehouseId
): Promise<void> {
  //console.log("CheckInsufficientQuantity called with orderQuantity:", JSON.stringify(orderQuantity), "and warehouseId:", warehouseId.getId());
  const { inv, order, dist } = await this.RequestAllNeededData(warehouseId);

  const internalOrdersToCreate: InternalOrder[] = []; 
  let productsToAllocate = [...orderQuantity.getItemId()];
  //console.log(JSON.stringify(dist));
  for (const whState of dist) {
    const whId = whState.getId();
    const productsForThisWarehouse: OrderItem[] = [];
    let orderItemsDetails: OrderItemDetail[] = [];
    for (const product of productsToAllocate) {
      const productInInv = inv.getInventory().find(
        (p) =>p.getIdWarehouse() === whId && p.getId() === product.getItemId().toString()
      );
      //console.log(JSON.stringify(productInInv, null, 2));
      if (!productInInv){
        console.log("Non ci sono prodotti con questo Id");
        continue;
      }
      const availableQty =
        productInInv.getQuantity() - product.getQuantity();

      if (availableQty < productInInv.getMinThres()){
        /*
        console.log("WarehouseId : " + whState.getId());
        console.log("Parte Inventario | Problema scende sotto la soglia : ");
        console.log("Parte Inventario | Soglia : "+ productInInv.getMinThres());
        console.log("Parte Inventario | Quantità dell'inventario : "+ productInInv.getQuantity());
        console.log("Parte Inventario | Quantità richiesta : "+ product.getQuantity());
        console.log("Parte Inventario | Quantità rimanente se fosse stata tolta "+ availableQty);
        */
        continue;
      }
      console.log(JSON.stringify(order, null, 2));
      if(order !== null){
        const pendingOrdersInternal = order
          .getInternalOrders()
          .filter(
            (o) =>
              o.getWarehouseDeparture() === whId &&
              o.getItemsDetail().some(
                (item) =>
                  item.getItem().getItemId() === Number(product.getItemId())
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
                  item.getItem().getItemId() === Number(product.getItemId())
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
        );/*
        console.log("Rimanente : "+ availableQty);
        console.log("Internal richiede : "+ pendingQtyInternal);
        console.log("Sell richiede : "+ pendingQtySell);*/
        const residualQty = availableQty - pendingQtyInternal - pendingQtySell;
        //console.log("Residuo : "+ residualQty);
        if (residualQty >= productInInv.getMinThres()) {
          const oI = new OrderItem(
            new ItemId(product.getItemId()),
            product.getQuantity()
          );
          const oID = new OrderItemDetail(oI, 0, productInInv.getUnitPrice());
          orderItemsDetails.push(oID);
          productsForThisWarehouse.push(product);
        }else{
          /*
          console.log("WarehouseId : " + whState.getId());
          console.log("Parte Ordine | Problema scende sotto la soglia : ");
          console.log("Parte Ordine | Soglia : "+ productInInv.getMinThres());
          console.log("Parte Ordine | Quantità disponibile : "+ availableQty);
          console.log("Parte Ordine | Quantità da togliere per InternalOrder : "+ pendingQtyInternal);
          console.log("Parte Ordine | Quantità da togliere per SellOrder : "+ pendingQtySell);
          console.log("Parte Ordine | Quantità rimanente se fosse stata tolta "+ residualQty);
          */
        }
      }else {
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
        warehouseId.getId(),
      );

      internalOrdersToCreate.push(internalOrder);

      productsToAllocate = productsToAllocate.filter(
        (p) => !productsForThisWarehouse.some((fp) => fp.getItemId() === p.getItemId())
      );

    if (productsToAllocate.length === 0) continue;
    }
  }

  if (productsToAllocate.length > 0) {
    console.log("Alcuni prodotti non hanno quantità sufficiente nei magazzini:", productsToAllocate.map((p) => p.getItemId()));
    //this.outboundPortsAdapter.sendOrder("CANCELORDER", new OrderId(orderQuantity.getId()), warehouseId);
    return Promise.resolve();
  }else{
    //this.logger.log(`Received orderQuantity: ${JSON.stringify(internalOrdersToCreate)}`);
    for (const internalOrder of internalOrdersToCreate) {
      try {
        console.log("Prodotti da allocare:", productsToAllocate.map(p => p.getItemId()));
        await this.outboundPortsAdapter.createInternalOrder(internalOrder, new OrderId(orderQuantity.getId()));
      } catch (err) {
        console.error("Errore invio InternalOrder:", err);
      }
    }
    //console.log("service : Magazzino mandato! \n"+ JSON.stringify(internalOrdersToCreate, null, 2));
  }
  return Promise.resolve();
}


  async sendNotification(message: string): Promise<void> {
    await this.outboundPortsAdapter.SendNotification(message);
  }

  async CheckWarehouseState(warehouseState : WarehouseState[]): Promise<void> {
    if (!warehouseState || warehouseState.length === 0) {
      //console.log("Nessun warehouse da controllare.");
      return;
    }
    const inactiveWarehouses = warehouseState.filter(ws => ws.getState() !== 'ACTIVE');
    let not = "";
    if (inactiveWarehouses.length === 0) {
      //console.log("Tutti i magazzini sono attivi.");
    } else {
      //console.log("Alcuni magazzini non sono attivi:");
        const notJson = inactiveWarehouses.map(ws => ({
          warehouseId: ws.getId(),
          state: ws.getState()
        }));
      inactiveWarehouses.forEach(ws => {
        not+= `|Warehouse ID: ` + JSON.stringify(ws.getId()) +" |State : "+  ws.getState() + "\n";
      });
      /*
      console.log("----------------------------------------------------------------------------------------------");
      console.log("|Service announcement|");
      console.log(not);
      console.log("----------------------------------------------------------------------------------------------");
      */
      //Chiamata ad observability?
      this.sendNotification(JSON.stringify(notJson));
    }
    return Promise.resolve()
  }

  async ManageOverMaxThres(
    product: Product,
  ): Promise<void> {
    const warehouseId = new WarehouseId(product.getIdWarehouse());
    const { inv, order, dist } = await this.RequestAllNeededData(warehouseId);
    for (const whState of dist) {
      const whId = whState.getId();
      const productInInv = inv.getInventory().find(
        (p) => p.getId() === product.getId() && p.getIdWarehouse() === whId
      );

      if (!productInInv){
       //console.log("Entro ProductInInv vuoto");
        continue; 
      }

      const availableQty = productInInv.getQuantity() + product.getQuantity();

      if (availableQty > productInInv.getMaxThres()){
        /*
        console.log("availableQty > product.getMaxThres()");
        console.log("product.getMaxThres() : "+product.getMaxThres());
        console.log("productInInv.getQuantity() : " + productInInv.getQuantity());
        console.log("product.getQuantity() : " + product.getQuantity());
        */
        continue; 
      }

      //Controllo se ci sono destinazioni che vengono da me
      if(order !== null){
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
        if (residualQty <= productInInv.getMaxThres()) {
          //Chiamata per creare un ordine nuovo avendo già i dati del magazzino trovato
          //per ricordare
          let oI = new OrderItem(new ItemId(Number(product.getId())), product.getQuantity() - product.getMaxThres());
          let oID = new OrderItemDetail(oI,0,product.getUnitPrice());
          let internalOrders = new InternalOrder(new OrderId(""),[oID],OrderState.PENDING, new Date(),warehouseId.getId(),whId);
          //console.log("service : Magazzino mandato! \n"+ JSON.stringify(internalOrders, null, 2));
          this.outboundPortsAdapter.createInternalOrder(internalOrders, new OrderId(""));
        
          return Promise.resolve();
        }//else console.log("!residualQty <= productInInv.getMaxThres()");
      }else {
        let oI = new OrderItem(new ItemId(Number(product.getId())), product.getQuantity() - product.getMaxThres());
        let oID = new OrderItemDetail(oI,0,product.getUnitPrice());
        let internalOrders = new InternalOrder(new OrderId(""),[oID],OrderState.PENDING, new Date(),warehouseId.getId(),whId);
        this.outboundPortsAdapter.createInternalOrder(internalOrders, new OrderId(""));
    }
    this.outboundPortsAdapter.sendInventory("MAX - Non disponibile", new ProductId(product.getId()), new WarehouseId(product.getIdWarehouse()));
    return Promise.resolve()
  }
  }
}
