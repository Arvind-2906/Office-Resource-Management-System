const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const Product = require('../src/models/Product');
const { generateToken } = require('../src/utils/generateToken');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

let customerToken;
let adminToken;
let adminUser;

beforeEach(async () => {
  await clearTestDB();

  const customer = await User.create({
    name: 'Customer User',
    email: 'cust@example.com',
    password: 'password123',
    role: 'CUSTOMER'
  });
  customerToken = generateToken(customer._id, 'CUSTOMER');

  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword123',
    role: 'ADMIN'
  });
  adminToken = generateToken(adminUser._id, 'ADMIN');
});

describe('Admin Authorization, Health & Metrics Tests', () => {
  test('GET /api/admin/dashboard - rejects CUSTOMER with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/admin/dashboard - allows ADMIN and returns analytics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalProducts).toBeDefined();
    expect(res.body.data.stats.totalUsers).toBeDefined();
  });

  test('PATCH /api/admin/orders/:id/status - allows admin to update status', async () => {
    const testProduct = await Product.create({
      name: 'Test Device',
      description: 'Test',
      price: 100,
      category: 'Electronics',
      brand: 'TestBrand',
      stock: 5,
      image: 'https://example.com/test.jpg'
    });

    const order = await Order.create({
      user: adminUser._id,
      items: [
        {
          product: testProduct._id,
          name: 'Test Device',
          price: 100,
          quantity: 1
        }
      ],
      shippingAddress: {
        street: '123 St',
        city: 'City',
        state: 'ST',
        postalCode: '12345',
        country: 'USA'
      },
      subtotal: 100,
      tax: 8,
      deliveryCharge: 0,
      discount: 0,
      total: 108,
      orderStatus: 'PENDING'
    });

    const res = await request(app)
      .patch(`/api/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED', message: 'Item dispatched via FedEx' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.order.orderStatus).toBe('SHIPPED');
    expect(res.body.data.order.trackingEvents.length).toBe(1);
  });

  test('GET /api/health - returns 200 UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('GET /api/health/live - returns 200 ALIVE status with uptime', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ALIVE');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  test('GET /api/health/ready - returns 200 READY status when DB connected', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('READY');
  });

  test('GET /metrics - exposes Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('http_requests_total');
    expect(res.text).toContain('http_request_duration_seconds');
  });
});
