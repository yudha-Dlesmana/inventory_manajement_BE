import {InventoryManager} from '../inventoryManager.js';

export default {
  'POST /transactions': async (req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const trx = await InventoryManager.createTransaction(data);
        res.statusCode = 201;
        res.end(JSON.stringify(trx));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  },
};
