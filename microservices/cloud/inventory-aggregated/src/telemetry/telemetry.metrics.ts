import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

export const inventoryProductsTotal = makeGaugeProvider({
  name: 'inventory_products_total',
  help: 'Numero totale di prodotti nell\'inventario di un magazzino',
  labelNames: ['warehouse', 'productId'],
});
