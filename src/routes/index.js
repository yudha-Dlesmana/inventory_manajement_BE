import url from 'url';
import productRoutes from './products.js';
import transactionRoutes from './transactions.js';
import reportRoutes from './reports.js';
import entityRoutes from './entities.js';

const routes = {
  ...productRoutes,
  ...transactionRoutes,
  ...reportRoutes,
  ...entityRoutes,
};

export function handleRoutes(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const routeKey = `${req.method} ${pathname}`;

  res.setHeader('Content-Type', 'application/json');

  
  if (routes[routeKey]) {
    return routes[routeKey](req, res, parsedUrl.query);
  }

  
  if (req.method === 'PUT' && pathname.startsWith('/products/')) {
    return routes['PUT /products'](req, res, parsedUrl.query);
  }

  if (req.method === 'GET' && pathname.startsWith('/products/')) {
    return routes['GET /products/:id']?.(req, res, parsedUrl.query);
  }

  if (req.method === 'DELETE' && pathname.startsWith('/products/')) {
    return routes['DELETE /products']?.(req, res, parsedUrl.query);
  }

  
  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Not Found' }));
}
