const { body, param } = require('express-validator');

const addToCartValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be an integer between 1 and 99')
];

const updateCartItemValidator = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99')
];

module.exports = {
  addToCartValidator,
  updateCartItemValidator
};
