import express, { Router } from 'express';
import * as path from 'path';

function url(
  url: string,
  params?: { [key: string]: unknown | unknown[] }
): string {
  const builder = new URL(url);
  for (const param in params) {
    const paramValue = params[param];
    if (Array.isArray(paramValue)) {
      for (const value of paramValue) {
        builder.searchParams.set(param, value);
      }
    } else {
      builder.searchParams.set(param, `${paramValue}`);
    }
  }
  return builder.toString();
}

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const productsApi = process.env.PRODUCTS_API;
const stockApi = process.env.STOCK_API;

const data = {
  orders: [
    {
      id: 1,
      items: [
        { id: 1, name: 'Settlers of Catan', price: 25.05, quantity: 1 },
        { id: 2, name: 'Ticket to Ride', price: 18.35, quantity: 1 },
      ],
    },
    {
      id: 2,
      items: [
        { id: 1, name: 'Settlers of Catan', price: 25.05, quantity: 2 },
        { id: 2, name: 'Ticket to Ride', price: 18.35, quantity: 1 },
      ],
    },
  ],
};

const app = express();
const router = express.Router();

type OrderRequest = {
  items: {
    productId: number;
    quantity: number;
  }[];
};

router.use(express.json());
router.get('/orders', (req, res) => {
  res.json(data.orders);
});
router.get('/orders/:id', (req, res) => {
  const id = req.params.id;
  const found = data.orders.find((item) => item.id === +id);
  if (found) {
    res.json(found);
    return;
  }
  res.status(404).send();
});

router.post('/orders', async (req, res) => {
  try {
    const body = req.body as OrderRequest;
    console.log(body);
    const productIds = body?.items?.map((i) => i.productId);
    if (productIds?.length) {
      const products = await fetch(
        url(`${productsApi}/products`, { id: productIds })
      ).then((r) => r.json());
      const stocks =
        (await fetch(url(`${stockApi}/stock`, { id: productIds })).then((r) =>
          r.json()
        )) || [];

      if (
        products?.length &&
        stocks?.length &&
        stocks?.every((s) => s.quantity > 0)
      ) {
        console.log('retrieved:', { products, stocks });
        const created = {
          id: 1 + data.orders.length,
          items: products.map(({ id, name }) => {
            const { price } = stocks.find((s) => s.id === id);
            const { quantity } = body.items.find((s) => s.productId === id);
            return {
              id,
              name,
              price,
              quantity,
            };
          }),
        };
        console.log('created:', created);

        data.orders.push(created);
        res.status(201).json(created);
        return;
      }
    }
    res.status(400).send();
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/health', (req, res) => {
  const address = server.address();
  console.log('health check', address);
  res.json({ status: 'UP' });
});

app.use('/api', router);

const server = app.listen(port, host, () => {
  console.log(
    `🎉 orders-api up and ready, listening at http://${host}:${port}`
  );
});
