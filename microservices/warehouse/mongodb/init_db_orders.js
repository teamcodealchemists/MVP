db = db.getSiblingDB('orders');

db.createCollection('internalOrders');

db.internalOrders.insertMany(
[
  {
    orderId: { id: "I5359cefb-d1e0-4d1f-82b3-173728305ffe" },
    items: [
      {
        item: {
          itemId: { id: 101 },
          quantity: 50
        },
        quantityReserved: 20,
        unitPrice: 15.5
      },
      {
        item: {
          itemId: { id: 102 },
          quantity: 30
        },
        quantityReserved: 10,
        unitPrice: 22.0
      }
    ],
    orderState: "PENDING",
    creationDate: new Date("2025-08-01T09:30:00Z"),
    warehouseDeparture: 1,
    warehouseDestination: 3,
    sellOrderReference: { id: "S0123456" }
  },
  {
    orderId: { id: "I55e624c5-a87e-4a26-b956-5ed78586987a" },
    items: [
      {
        item: {
          itemId: { id: 103 },
          quantity: 40
        },
        quantityReserved: 15,
        unitPrice: 9.99
      }
    ],
    orderState: "PROCESSING",
    creationDate: new Date("2025-08-05T11:00:00Z"),
    warehouseDeparture: 2,
    warehouseDestination: 5,
    sellOrderReference: { id: "S0123456" }
  }
]);


db.createCollection('sellOrders');

db.sellOrders.insertMany(
[
  {
    orderId: { id: "Sb2e567ad-5a72-498b-8fd5-b431d72ebc84" },
    items: [
      {
        item: {
          itemId: { id: 201 },
          quantity: 5
        },
        quantityReserved: 5,
        unitPrice: 199.99
      },
      {
        item: {
          itemId: { id: 202 },
          quantity: 2
        },
        quantityReserved: 2,
        unitPrice: 349.5
      }
    ],
    orderState: "SHIPPED",
    creationDate: new Date("2025-08-03T15:20:00Z"),
    warehouseDeparture: 4,
    destinationAddress: "Via Roma 123, Padova, Italia"
  },
  {
    orderId: { id: "S9f15ebe7-d21a-4a70-aa13-bbb69e98ff3a" },
    items: [
      {
        item: {
          itemId: { id: 203 },
          quantity: 1
        },
        quantityReserved: 1,
        unitPrice: 1299.0
      }
    ],
    orderState: "COMPLETED",
    creationDate: new Date("2025-08-07T10:45:00Z"),
    warehouseDeparture: 2,
    destinationAddress: "Corso Italia 45, Messina, Italia"
  }
]);


db.createCollection('orderItemDetails');

db.orderitemDetails.insertMany([
  {
    item: {
      itemId: { id: 301 },
      quantity: 100
    },
    quantityReserved: 60,
    unitPrice: 5.5
  },
  {
    item: {
      itemId: { id: 302 },
      quantity: 80
    },
    quantityReserved: 20,
    unitPrice: 12.75
  },
  {
    item: {
      itemId: { id: 303 },
      quantity: 150
    },
    quantityReserved: 75,
    unitPrice: 2.99
  }
]);