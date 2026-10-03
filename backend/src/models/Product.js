const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be a positive number']
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      trim: true,
      index: true
    },
    brand: {
      type: String,
      required: [true, 'Please provide product brand'],
      trim: true,
      index: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    numReviews: {
      type: Number,
      default: 12
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product inventory stock'],
      min: [0, 'Stock cannot be negative'],
      default: 10
    },
    image: {
      type: String,
      required: [true, 'Please provide product image URL'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Add text index for keyword search across name, brand, description
productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);
