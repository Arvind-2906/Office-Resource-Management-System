const { body, param, query } = require('express-validator');

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer 0 or greater'),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
];

const updateProductValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer 0 or greater')
];

module.exports = {
  createProductValidator,
  updateProductValidator
};
