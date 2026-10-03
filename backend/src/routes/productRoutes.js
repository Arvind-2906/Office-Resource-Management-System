const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  createProductValidator,
  updateProductValidator
} = require('../validators/productValidator');
const { validate } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/filters', productController.getFilterOptions);
router.get('/:id', productController.getProductById);

// Admin-only routes
router.post(
  '/',
  protect,
  adminOnly,
  createProductValidator,
  validate,
  productController.createProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  updateProductValidator,
  validate,
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  productController.deleteProduct
);

module.exports = router;
