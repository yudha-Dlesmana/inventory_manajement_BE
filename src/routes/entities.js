import {InventoryManager} from '../inventoryManager.js';

export default {
  'POST /entities': async (req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const { name, type } = JSON.parse(body);
        const entity = await InventoryManager.addEntity(name, type);
        res.statusCode = 201;
        res.end(JSON.stringify(entity));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  },

  'GET /entities': async (req, res, query) => {
    try {
      const { type } = query;
      const entities = await InventoryManager.getEntities(type);
      res.end(JSON.stringify(entities));
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: err.message }));
    }
  },
};
