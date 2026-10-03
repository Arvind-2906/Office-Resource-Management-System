const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { calculateOrderTotals } = require('../utils/calculateTotal');
const logger = require('../utils/logger');

class OrderService {
  async createOrder(userId, { shippingAddress, paymentMethod = 'CARD', discountAmount = 0 }) {
    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      const error = new Error('Your cart is empty. Add products before placing an order.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate availability and build verified items list
    const orderItems = [];
    for (const item of cart.items) {
      if (!item.product) {
        const error = new Error('One or more products in your cart are no longer available.');
        error.statusCode = 400;
        throw error;
      }

      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        const error = new Error(
          `Insufficient stock for "${item.product.name}". Available: ${product ? product.stock : 0}, requested: ${item.quantity}`
        );
        error.statusCode = 400;
        throw error;
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price, // Server verified price
        quantity: item.quantity
      });
    }

    // 3. Calculate verified totals on backend
    const { subtotal, tax, deliveryCharge, discount, total } = calculateOrderTotals(
      orderItems,
      discountAmount
    );

    // 4. Create Order document
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      subtotal,
      tax,
      deliveryCharge,
      discount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      orderStatus: 'PENDING',
      trackingEvents: [
        {
          status: 'PENDING',
          message: 'Order placed successfully. Awaiting payment/confirmation.',
          timestamp: new Date()
        }
      ]
    });

    // 5. Deduct inventory stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 6. Clear user cart
    cart.items = [];
    cart.total = 0;
    await cart.save();

    logger.orderEvent('ORDER_CREATED', {
      orderId: order._id,
      userId,
      total,
      itemCount: orderItems.length
    });

    return order;
  }

  async getMyOrders(userId) {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    return orders;
  }

  async getOrderById(orderId, userId, userRole) {
    const order = await Order.findById(orderId).populate('user', 'name email phone');
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership unless admin
    if (order.user._id.toString() !== userId.toString() && userRole !== 'ADMIN') {
      const error = new Error('Access denied. You do not own this order.');
      error.statusCode = 403;
      throw error;
    }

    return order;
  }

  async cancelOrder(orderId, userId, userRole) {
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.user.toString() !== userId.toString() && userRole !== 'ADMIN') {
      const error = new Error('Access denied. You do not own this order.');
      error.statusCode = 403;
      throw error;
    }

    // Cancellation only allowed if not already shipped or delivered
    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus)) {
      const error = new Error(`Order cannot be cancelled in status: ${order.orderStatus}`);
      error.statusCode = 400;
      throw error;
    }

    if (order.orderStatus === 'CANCELLED') {
      const error = new Error('Order is already cancelled');
      error.statusCode = 400;
      throw error;
    }

    // Restore inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.orderStatus = 'CANCELLED';
    if (order.paymentStatus !== 'SUCCESS') {
      order.paymentStatus = 'CANCELLED';
    }
    order.trackingEvents.push({
      status: 'CANCELLED',
      message: 'Order was cancelled by the customer.',
      timestamp: new Date()
    });

    await order.save();

    logger.orderEvent('ORDER_CANCELLED', {
      orderId: order._id,
      userId
    });

    return order;
  }

  async getAllOrders({ status, page = 1, limit = 20 }) {
    const query = {};
    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  async updateOrderStatus(orderId, newStatus, message) {
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!validStatuses.includes(newStatus)) {
      const error = new Error(`Invalid status: ${newStatus}`);
      error.statusCode = 400;
      throw error;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // If changing to CANCELLED and was not cancelled before, restore stock
    if (newStatus === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.orderStatus = newStatus;
    const defaultMessages = {
      CONFIRMED: 'Order confirmed and scheduled for packing.',
      PACKED: 'Order has been packed in warehouse and is ready for courier.',
      SHIPPED: 'Package is in transit with logistics carrier.',
      OUT_FOR_DELIVERY: 'Courier partner is out for delivery to your address.',
      DELIVERED: 'Package successfully delivered. Thank you for shopping with us!',
      CANCELLED: 'Order cancelled by administrator.'
    };

    order.trackingEvents.push({
      status: newStatus,
      message: message || defaultMessages[newStatus] || `Status updated to ${newStatus}`,
      timestamp: new Date()
    });

    await order.save();

    logger.orderEvent('ORDER_STATUS_UPDATED', {
      orderId: order._id,
      newStatus
    });

    return order;
  }
}

module.exports = new OrderService();
