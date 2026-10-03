const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/Product');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

let token;
let product;

beforeEach(async () => {
  await clearTestDB();

  const regRes = await request(app).post('/api/auth/register').send({
    name: 'Cart Tester',
    email: 'cartuser@example.com',
    password: 'password123'
  });
  token = regRes.body.data.token;

  product = await Product.create({
    name: 'Logitech Wireless Mouse',
    description: 'Ergonomic multi-device mouse.',
    price: 49.99,
    category: 'Accessories',
    brand: 'Logitech',
    stock: 5,
    image: 'https://example.com/mouse.jpg'
  });
});

describe('Shopping Cart API Tests', () => {
  test('POST /api/cart - adds product to cart and calculates total', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id.toString(), quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.cart.items.length).toBe(1);
    expect(res.body.data.cart.total).toBe(99.98);
  });

  test('POST /api/cart - rejects adding quantity exceeding stock', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id.toString(), quantity: 10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Insufficient stock');
  });

  test('PATCH /api/cart/:productId - updates quantity', async () => {
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id.toString(), quantity: 1 });

    const res = await request(app)
      .patch(`/api/cart/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.cart.items[0].quantity).toBe(3);
    expect(res.body.data.cart.total).toBe(149.97);
  });

  test('DELETE /api/cart/:productId - removes item from cart', async () => {
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id.toString(), quantity: 1 });

    const res = await request(app)
      .delete(`/api/cart/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.cart.items.length).toBe(0);
    expect(res.body.data.cart.total).toBe(0);
  });
});
