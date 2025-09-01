import { InternalOrderDTO } from '../dto/internalOrder.dto';

export interface InternalOrderEventListener {

addInternalOrder(InternalOrderDTO): void;

}