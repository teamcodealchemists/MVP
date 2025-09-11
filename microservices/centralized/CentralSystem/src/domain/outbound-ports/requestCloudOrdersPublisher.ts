import { Order } from "../order.entity";

export interface RequestCloudOrdersPublisher {
  CloudOrderRequest(): void;
}
