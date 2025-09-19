import {InventoryManager} from '../inventoryManager.js';

export default {
  'GET /reports/inventory': async (req, res) => {
    const value = await InventoryManager.getInventoryValue();
    res.end(JSON.stringify({ totalInventoryValue: value }));
  },

  'GET /reports/low-stock': async (req, res) => {
    const products = await InventoryManager.getLowStockProducts();
    res.end(JSON.stringify(products));
  },
};
