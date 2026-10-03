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

beforeEach(async () => {
  await clearTestDB();
  await Product.insertMany([
    {
      name: 'Sony Noise Canceling Headphones',
      description: 'Premium wireless headphones with industry-leading ANC.',
      price: 299.99,
      category: 'Audio',
      brand: 'Sony',
      rating: 4.8,
      stock: 15,
      image: 'https://example.com/sony.jpg'
    },
    {
      name: 'Apple MacBook Pro 14',
      description: 'Powerful laptop with Apple Silicon chip.',
      price: 1899.00,
      category: 'Computing',
      brand: 'Apple',
      rating: 4.9,
      stock: 5,
      image: 'https://example.com/macbook.jpg'
    },
    {
      name: 'Anker USB-C Fast Charger',
      description: 'Compact 65W GaN charger.',
      price: 39.99,
      category: 'Accessories',
      brand: 'Anker',
      rating: 4.6,
      stock: 40,
      image: 'https://example.com/anker.jpg'
    }
  ]);
});

describe('Product Search and Discovery API Tests', () => {
  test('GET /api/products - returns paginated product list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBe(3);
    expect(res.body.data.pagination.total).toBe(3);
  });

  test('GET /api/products?search=headphones - filters by keyword', async () => {
    const res = await request(app).get('/api/products?search=headphones');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products.length).toBe(1);
    expect(res.body.data.products[0].name).toContain('Headphones');
  });

  test('GET /api/products?category=Computing - filters by category', async () => {
    const res = await request(app).get('/api/products?category=Computing');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products.length).toBe(1);
    expect(res.body.data.products[0].brand).toBe('Apple');
  });

  test('GET /api/products?minPrice=100&maxPrice=500 - filters by price range', async () => {
    const res = await request(app).get('/api/products?minPrice=100&maxPrice=500');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products.length).toBe(1);
    expect(res.body.data.products[0].price).toBe(299.99);
  });

  test('GET /api/products?sort=price_asc - sorts products ascending by price', async () => {
    const res = await request(app).get('/api/products?sort=price_asc');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products[0].price).toBe(39.99);
    expect(res.body.data.products[2].price).toBe(1899.00);
  });

  test('GET /api/products/:id - returns single product details', async () => {
    const product = await Product.findOne({ brand: 'Sony' });
    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.product.name).toBe(product.name);
  });

  test('GET /api/products/:id - returns 404 for invalid ObjectId', async () => {
    const res = await request(app).get('/api/products/64f123456789012345678901');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
