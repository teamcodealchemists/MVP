import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";import { Order } from "src/domain/order.entity";

import { DataMapper } from "src/interfaces/data.mapper";
import { InternalOrderModel } from "./model/internalOrder.model";
import { SellOrderModel } from "./model/sellOrder.model";
import { OrderItemDetailModel } from "./model/orderItemDetail.model";

import { OrdersRepository } from "src/domain/orders.repository";
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

@Injectable()
export class OrdersRepositoryMongo implements OrdersRepository {
  constructor(
    @InjectModel("InternalOrder") private readonly internalOrderModel: InternalOrderModel,
    @InjectModel("SellOrder") private readonly sellOrderModel: SellOrderModel,
    @InjectModel("OrderItemDetail") private readonly orderItemDetailModel: OrderItemDetailModel,
    private readonly mapper: DataMapper
  ) {}
  
    async getById(id: OrderId): Promise<InternalOrder | SellOrder> {
        try {
            const internalDoc = await this.internalOrderModel.findOne({ "orderId.id": id.getId() }).lean().exec();
            if (internalDoc) return await this.mapper.internalOrderToDomain(internalDoc as any);

            const sellDoc = await this.sellOrderModel.findOne({ "orderId.id": id.getId() }).lean().exec();
            if (sellDoc) return await this.mapper.sellOrderToDomain(sellDoc as any);

            throw new Error(`Ordine con ID ${id.getId()} non trovato`);
        } catch (error) {
            console.error("Errore durante la ricerca dell'ordine per ID:", error);
            throw error;
        }
    }

    async getState(id: OrderId): Promise<OrderState> {
        try {
            const internalDoc = await this.internalOrderModel.findOne({ "orderId.id": id.getId() }, { orderState: 1 }).lean().exec();
            if (internalDoc) return internalDoc.orderState as OrderState;

            const sellDoc = await this.sellOrderModel.findOne({ "orderId.id": id.getId() }, { orderState: 1 }).lean().exec();
            if (sellDoc) return sellDoc.orderState as OrderState;

            throw new Error(`Stato per ordine ID ${id.getId()} non trovato`);
        } catch (error) {
            console.error("Errore durante la ricerca dello stato dell'ordine:", error);
            throw error;
        }
    }

    async getAllOrders(): Promise<Orders> {
        try {
            const internalDocs = await this.internalOrderModel.find().lean().exec();
            const sellDocs = await this.sellOrderModel.find().lean().exec();

            const internalOrders = await Promise.all(internalDocs.map(doc => this.mapper.internalOrderToDomain(doc as any)));
            const sellOrders = await Promise.all(sellDocs.map(doc => this.mapper.sellOrderToDomain(doc as any)));

            return new Orders(sellOrders, internalOrders);
        } catch (error) {
            console.error("Errore durante il recupero di tutti gli ordini:", error);
            throw error;
        }
    }

    async addSellOrder(order: SellOrder): Promise<void> {
        try {
            const dto = await this.mapper.sellOrderToDTO(order);
            const newSellOrder = new this.sellOrderModel(dto);
            await newSellOrder.save();
        } catch (error) {
            console.error("Errore durante l'aggiunta del SellOrder:", error);
            throw error;
        }
    }

    async addInternalOrder(order: InternalOrder): Promise<void> {
        try {
            const dto = await this.mapper.internalOrderToDTO(order);
            const newInternalOrder = new this.internalOrderModel(dto);
            await newInternalOrder.save();
        } catch (error) {
            console.error("Errore durante l'aggiunta dell'InternalOrder:", error);
            throw error;
        }
    }

    async removeById(id: OrderId): Promise<boolean> {
      /* Rimozione
        try {
            const resInternal = await this.internalOrderModel.deleteOne({ "orderId.id": id.getId() }).exec();
            if (resInternal.deletedCount > 0) return true;

            const resSell = await this.sellOrderModel.deleteOne({ "orderId.id": id.getId() }).exec();
            return resSell.deletedCount > 0;
        } catch (error) {
            console.error("Errore durante la rimozione dell'ordine:", error);
            throw error;
        } 
            
        Cancellazione */
        const currentState = await this.getState(id);

        if (currentState === OrderState.CANCELED) {
            return false; // E' gia in stato "CANCELED"
        }

        const updatedOrder = await this.updateOrderState(id, OrderState.CANCELED);

        // Se l'ordine è stato aggiornato correttamente, restituisci true
        return updatedOrder.getOrderState() === OrderState.CANCELED;
        
    }

    async updateOrderState(id: OrderId, state: OrderState): Promise<InternalOrder | SellOrder> {
        try {
            const internalDoc = await this.internalOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { orderState: state },
                { new: true }
            ).lean().exec();

            if (internalDoc) return await this.mapper.internalOrderToDomain(internalDoc as any);

            const sellDoc = await this.sellOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { orderState: state },
                { new: true }
            ).lean().exec();
        
            if (sellDoc) return await this.mapper.sellOrderToDomain(sellDoc as any);

            throw new Error(`Impossibile aggiornare lo stato: ordine con ID ${id.getId()} non trovato`);
        } catch (error) {
            console.error("Errore durante l'aggiornamento dello stato dell'ordine:", error);
            throw error;
        }
    }

    async genUniqueId(): Promise<OrderId> {
        try {
            const uniqueId = `ORD-${Date.now()}`;
            return new OrderId(uniqueId);
        } catch (error) {
            console.error("Errore durante la generazione dell'ID univoco:", error);
            throw error;
        }
  }

    async updateReservedStock(id: OrderId, items: OrderItem[]): Promise<InternalOrder | SellOrder> {
        try {
            const updateItems = items.map(i => ({
                item: { itemId: { id: i.getItemId() }, quantity: i.getQuantity() },
                quantityReserved: i.getQuantity(), 
                unitPrice: 0 
            }));

            const internalDoc = await this.internalOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { $set: { items: updateItems } },
                { new: true }
            ).lean().exec();
            if (internalDoc) return await this.mapper.internalOrderToDomain(internalDoc as any);

            const sellDoc = await this.sellOrderModel.findOneAndUpdate(
                { "orderId.id": id.getId() },
                { $set: { items: updateItems } },
                { new: true }
            ).lean().exec();
            if (sellDoc) return await this.mapper.sellOrderToDomain(sellDoc as any);

            throw new Error(`Impossibile aggiornare la riserva: ordine con ID ${id.getId()} non trovato`);
        } catch (error) {
        console.error("Errore durante l'aggiornamento della quantità riservata:", error);
        throw error;
        }
    }
}
