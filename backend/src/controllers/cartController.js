const cartService = require('../services/cartService');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user._id, productId, quantity || 1);
    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateItemQuantity(req.user._id, productId, quantity);
    return res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await cartService.removeItem(req.user._id, productId);
    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
