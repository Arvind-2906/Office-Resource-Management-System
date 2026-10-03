const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    method: {
      type: String,
      enum: ['UPI', 'CARD', 'NET_BANKING', 'COD'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    details: {
      cardLast4: { type: String, default: '' },
      upiId: { type: String, default: '' },
      bankName: { type: String, default: '' },
      failureReason: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
