import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

export const InsertedOrdersGaugeProvider = makeGaugeProvider({
  name: 'inserted_orders_gauge',
  help: 'Numero di ordini inseriti nei magazzini al minuto',
  labelNames: ['warehouse'],
});