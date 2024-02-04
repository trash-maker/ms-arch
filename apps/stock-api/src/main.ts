import express from 'express';
import * as jsonServer from 'json-server';
import * as path from 'path';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const data = {
  stock: [
    { 
      id: 1,
      price: 45.40,
      quantity: 5,
    },
    { 
      id: 2,
      price: 35.05,
      quantity: 3,
    }
  ],
};

const app = express();
const router = jsonServer.router(data);

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/health', (req, res) => {
  const address = server.address();
  console.log('health check', address);
  res.json({ status: 'UP' });
});

app.use('/api', router);

const server = app.listen(port, host, () => {
  console.log(
    `🎉 stock-api up and ready, listening at http://${host}:${port}`
  );
});
