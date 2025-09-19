import http from 'http';
import { testConnection } from './src/database/testconnection.js';
import { handleRoutes } from './src/routes/index.js';

const PORT = Number(process.env.PORT) || 3000;

await testConnection()

const server = http.createServer((req, res) => {
   handleRoutes(req,res)
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});