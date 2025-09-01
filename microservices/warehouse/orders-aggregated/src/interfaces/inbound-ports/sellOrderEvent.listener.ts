import { SellOrderDTO } from '../dto/sellOrder.dto';

export interface SellOrderEventListener {

addSellOrder(SellOrderDTO): void;

}