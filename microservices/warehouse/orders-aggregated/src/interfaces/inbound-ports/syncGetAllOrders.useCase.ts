import { SyncOrdersDTO } from '../dto/syncOrders.dto';

export interface SyncGetAllOrdersUseCase {

getAllOrders(): Promise<SyncOrdersDTO> ;

}