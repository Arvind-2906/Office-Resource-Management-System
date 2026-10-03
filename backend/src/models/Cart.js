const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: [cartItemSchema],
    total: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Method to recalculate total
cartSchema.methods.calculateTotal = function () {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.total = Math.round(this.total * 100) / 100;
  return this.total;
};

module.exports = mongoose.model('Cart', cartSchema);
