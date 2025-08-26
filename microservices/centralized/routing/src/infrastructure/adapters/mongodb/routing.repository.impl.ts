import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoutingRepository } from './../../../domain/routing.repository';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { WarehouseState } from 'src/domain/warehouseState.entity';
import { WarehouseAddress } from 'src/domain/warehouseAddress.entity';



@Injectable()
export class RoutingRepositoryMongo implements RoutingRepository {
  constructor(
  ) {} 

  async saveWarehouse(warehouse: WarehouseId): Promise<void> {

  }

  async getWarehouseById(id: WarehouseId): Promise<WarehouseId> {
      return id;
  }

  async getAllWarehouses(): Promise<WarehouseId[]> {
      return [];
  }

  async saveWarehouseAddress(address: WarehouseAddress): Promise<void> {

  }

  async removeWarehouseAddress(id: WarehouseId): Promise<void> {

  }

  async updateWarehouseAddress(address: WarehouseAddress): Promise<void> {

  }

  async getWarehouseAddressById(id: WarehouseId): Promise<WarehouseAddress> {
      return new WarehouseAddress(new WarehouseState(id, "default"), "");
  }

  async getAllWarehouseAddresses(): Promise<WarehouseAddress[]> {
      return [];
  }

  async saveWarehouseState(state: WarehouseState): Promise<void> {

  }

  async getWarehouseStateById(id: WarehouseId): Promise<WarehouseState> {
      return new WarehouseState(id, "default");
  }

  async getAllWarehouseStates(): Promise<WarehouseState[]> {
      return [];
  }

}