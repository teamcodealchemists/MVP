import { OrderId } from "../orderId.entity";

export interface ResultProductAvailabilityPublisher {
  insufficientProductAvailability(): Promise<void>;
  sufficientProductAvailability(order : OrderId): Promise<void>;
}