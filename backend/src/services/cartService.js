const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [], total: 0 });
    }
    return cart;
  }

  async addToCart(userId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (product.stock < quantity) {
      const error = new Error(`Insufficient stock. Only ${product.stock} units available.`);
      error.statusCode = 400;
      throw error;
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], total: 0 });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        const error = new Error(`Cannot add more. Total in cart would exceed available stock (${product.stock}).`);
        error.statusCode = 400;
        throw error;
      }
      cart.items[itemIndex].quantity = newQuantity;
      cart.items[itemIndex].price = product.price; // Update to current price
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price
      });
    }

    cart.calculateTotal();
    await cart.save();
    return await this.getCart(userId);
  }

  async updateItemQuantity(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (quantity > product.stock) {
      const error = new Error(`Requested quantity exceeds available stock (${product.stock}).`);
      error.statusCode = 400;
      throw error;
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      const error = new Error('Product not in cart');
      error.statusCode = 404;
      throw error;
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.price;
    }

    cart.calculateTotal();
    await cart.save();
    return await this.getCart(userId);
  }

  async removeItem(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    cart.calculateTotal();
    await cart.save();
    return await this.getCart(userId);
  }

  async clearCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [], total: 0 });
      return cart;
    }

    cart.items = [];
    cart.total = 0;
    await cart.save();
    return cart;
  }
}

module.exports = new CartService();
