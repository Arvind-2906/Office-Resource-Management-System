const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const {
  addToCartValidator,
  updateCartItemValidator
} = require('../validators/cartValidator');
const { validate } = require('../middleware/validationMiddleware');

router.use(protect); // All cart actions require authentication

router.get('/', cartController.getCart);
router.post('/', addToCartValidator, validate, cartController.addToCart);
router.patch('/:productId', updateCartItemValidator, validate, cartController.updateCartItem);
router.delete('/:productId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
