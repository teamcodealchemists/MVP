import { Inventory } from "../inventory.entity";

export interface RequestCloudInventoryPublisher {
  CloudInventoryRequest(): void;
}
