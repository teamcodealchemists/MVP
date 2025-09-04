import { OrderId } from "../orderId.entity";
import { ProductQuantity } from "../productQuantity.entity";

export interface ReservetionPort {
  reservedQuantities(orderId: OrderId, product : ProductQuantity[]): Promise<void>;
}
