const orderService = require('../services/orderService');

const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, discountAmount } = req.body;
    const order = await orderService.createOrder(req.user._id, {
      shippingAddress,
      paymentMethod,
      discountAmount
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user._id,
      req.user.role
    );
    return res.status(200).json({
      success: true,
      message: 'Order details fetched successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(
      req.params.id,
      req.user._id,
      req.user.role
    );
    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
};
