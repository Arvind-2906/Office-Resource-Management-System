const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const logger = require('../utils/logger');

class PaymentService {
  async processPayment(userId, { orderId, method, simulateFailure = false, details = {} }) {
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.user.toString() !== userId.toString()) {
      const error = new Error('Access denied. Order does not belong to you.');
      error.statusCode = 403;
      throw error;
    }

    if (order.paymentStatus === 'SUCCESS') {
      const error = new Error('Payment has already been completed for this order.');
      error.statusCode = 400;
      throw error;
    }

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Clean details to ensure zero plain card or CVV is stored
    const sanitizedDetails = {
      cardLast4: details.cardNumber ? details.cardNumber.slice(-4) : '4242',
      upiId: details.upiId || (method === 'UPI' ? 'user@okhdfcbank' : ''),
      bankName: details.bankName || (method === 'NET_BANKING' ? 'HDFC Bank' : ''),
      failureReason: simulateFailure ? 'Simulated payment gateway timeout / insufficient balance' : ''
    };

    const status = simulateFailure ? 'FAILED' : 'SUCCESS';

    const payment = await Payment.create({
      order: order._id,
      user: userId,
      method,
      amount: order.total,
      status,
      transactionId,
      details: sanitizedDetails
    });

    if (status === 'SUCCESS') {
      order.paymentStatus = 'SUCCESS';
      if (order.orderStatus === 'PENDING') {
        order.orderStatus = 'CONFIRMED';
      }
      order.trackingEvents.push({
        status: 'CONFIRMED',
        message: `Payment received ($${order.total}) via ${method}. Transaction ID: ${transactionId}`,
        timestamp: new Date()
      });
      await order.save();

      logger.paymentEvent('PAYMENT_SUCCESS', {
        orderId: order._id,
        transactionId,
        amount: order.total,
        method
      });
    } else {
      order.paymentStatus = 'FAILED';
      await order.save();

      logger.paymentEvent('PAYMENT_FAILED', {
        orderId: order._id,
        transactionId,
        reason: sanitizedDetails.failureReason
      });
    }

    return payment;
  }

  async getPaymentByOrderId(orderId, userId, userRole) {
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.user.toString() !== userId.toString() && userRole !== 'ADMIN') {
      const error = new Error('Access denied to payment information');
      error.statusCode = 403;
      throw error;
    }

    const payments = await Payment.find({ order: orderId }).sort({ createdAt: -1 });
    return payments;
  }
}

module.exports = new PaymentService();
