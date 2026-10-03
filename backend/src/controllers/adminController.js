const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const orderService = require('../services/orderService');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      recentOrders,
      lowStockProducts,
      revenueResult
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'CUSTOMER' }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'PENDING' }),
      Order.countDocuments({ orderStatus: 'DELIVERED' }),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Product.find({ stock: { $lte: 5 } })
        .select('name stock price category')
        .lean(),
      Order.aggregate([
        { $match: { paymentStatus: 'SUCCESS' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0
      ? Math.round(revenueResult[0].totalRevenue * 100) / 100
      : 0;

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard statistics fetched successfully',
      data: {
        stats: {
          totalProducts,
          totalUsers,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          lowStockCount: lowStockProducts.length
        },
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await orderService.getAllOrders({ status, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const order = await orderService.updateOrderStatus(id, status, message);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers
};
