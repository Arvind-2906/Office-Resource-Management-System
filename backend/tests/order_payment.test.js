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
    name: 'Order Tester',
    email: 'orderuser@example.com',
    password: 'password123'
  });
  token = regRes.body.data.token;

  product = await Product.create({
    name: 'Mechanical Keyboard',
    description: 'Custom mechanical keyboard.',
    price: 150.00,
    category: 'Computing',
    brand: 'TechNova',
    stock: 10,
    image: 'https://example.com/keyboard.jpg'
  });

  // Add product to cart
  await request(app)
    .post('/api/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId: product._id.toString(), quantity: 2 });
});

describe('Checkout, Order & Simulated Payment API Tests', () => {
  const shippingAddress = {
    street: '123 Main Street',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98101',
    country: 'USA'
  };

  test('POST /api/orders - places order from cart, calculates totals, and deducts inventory', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shippingAddress,
        paymentMethod: 'CARD'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.items.length).toBe(1);
    expect(res.body.data.order.subtotal).toBe(300.00);
    // Subtotal >= 100 -> free delivery ($0), tax = 24.00, total = 324.00
    expect(res.body.data.order.total).toBe(324.00);

    // Verify inventory deduction (10 - 2 = 8)
    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(8);
  });

  test('POST /api/payments - completes simulated payment and confirms order', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingAddress, paymentMethod: 'CARD' });

    const orderId = orderRes.body.data.order._id;

    const payRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        method: 'CARD',
        simulateFailure: false,
        details: { cardNumber: '4242424242424242' }
      });

    expect(payRes.statusCode).toBe(200);
    expect(payRes.body.data.payment.status).toBe('SUCCESS');
    expect(payRes.body.data.payment.transactionId).toBeDefined();

    // Verify order status updated to CONFIRMED
    const getOrder = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getOrder.body.data.order.orderStatus).toBe('CONFIRMED');
    expect(getOrder.body.data.order.paymentStatus).toBe('SUCCESS');
  });

  test('POST /api/payments - handles simulated failure test case', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingAddress, paymentMethod: 'UPI' });

    const orderId = orderRes.body.data.order._id;

    const payRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        method: 'UPI',
        simulateFailure: true
      });

    expect(payRes.statusCode).toBe(400);
    expect(payRes.body.data.payment.status).toBe('FAILED');
  });

  test('PATCH /api/orders/:id/cancel - allows customer to cancel order and restores stock', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingAddress, paymentMethod: 'COD' });

    const orderId = orderRes.body.data.order._id;

    const cancelRes = await request(app)
      .patch(`/api/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.data.order.orderStatus).toBe('CANCELLED');

    // Verify stock restored (back to 10)
    const restoredProduct = await Product.findById(product._id);
    expect(restoredProduct.stock).toBe(10);
  });
});
