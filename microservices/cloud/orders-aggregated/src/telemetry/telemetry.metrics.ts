import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

export const ActiveOrdersGaugeProvider = makeGaugeProvider({
  name: 'active_orders_gauge',
  help: 'Numero di ordini attivi nel magazzino',
  labelNames: ['warehouse'],
});