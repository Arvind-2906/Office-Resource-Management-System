const Product = require('../models/Product');
const Category = require('../models/Category');

class ProductService {
  async getProducts({
    search = '',
    category = '',
    brand = '',
    minPrice,
    maxPrice,
    minRating,
    sort = 'newest',
    page = 1,
    limit = 12
  }) {
    const query = {};

    // Partial keyword search across name and brand
    if (search && search.trim() !== '') {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { brand: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All' && category.trim() !== '') {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Brand filter
    if (brand && brand !== 'All' && brand.trim() !== '') {
      query.brand = { $regex: `^${brand.trim()}$`, $options: 'i' };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Rating filter
    if (minRating !== undefined && !isNaN(Number(minRating))) {
      query.rating = { $gte: Number(minRating) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating_desc') {
      sortOptions = { rating: -1 };
    } else if (sort === 'name_asc') {
      sortOptions = { name: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages
      }
    };
  }

  async getProductById(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async createProduct(productData) {
    const product = await Product.create(productData);
    return product;
  }

  async updateProduct(productId, updateData) {
    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true
    });
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async deleteProduct(productId) {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async getCategories() {
    const categories = await Category.find().sort({ name: 1 });
    return categories;
  }

  async getFilterOptions() {
    const [categories, brands] = await Promise.all([
      Product.distinct('category'),
      Product.distinct('brand')
    ]);
    return {
      categories: categories.sort(),
      brands: brands.sort()
    };
  }
}

module.exports = new ProductService();
