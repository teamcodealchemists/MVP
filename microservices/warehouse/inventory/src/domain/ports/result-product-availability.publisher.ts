import { OrderId } from "../orderId.entity";

export interface ResultProductAvailabilityPublisher {
  sufficientProductAvailability(order : OrderId): Promise<void>;
}