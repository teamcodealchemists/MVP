export interface RestockingRequestPort {
  requestRestock(productId: string, number: number): Promise<void>;
}
