import {InventoryManager} from '../inventoryManager.js';

export default {
   
  'POST /products': async (req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const newProduct = await InventoryManager.addProduct(data);
        res.statusCode = 201;
        res.end(JSON.stringify(newProduct));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  },

  'GET /products': async (req, res, query) => {
    const { category, page = 1, limit = 10 } = query;
    const products = await InventoryManager.getProductsByCategory(category, page, limit);
    res.end(JSON.stringify(products));
  },

  'PUT /products': async (req, res) => {
  if (req.method === 'PUT' && req.url.startsWith('/products/')) {
    const parts = req.url.split('/');
    const id = parts[2];

    if (!id) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Product id required' }));
    }

    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const updated = await InventoryManager.updateProduct(id, data);

        if (!updated) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Product not found' }));
        }

        res.statusCode = 200;
        res.end(JSON.stringify(updated));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
  },
};
