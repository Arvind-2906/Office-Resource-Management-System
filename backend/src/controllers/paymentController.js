const paymentService = require('../services/paymentService');

const processPayment = async (req, res, next) => {
  try {
    const { orderId, method, simulateFailure, details } = req.body;
    const payment = await paymentService.processPayment(req.user._id, {
      orderId,
      method,
      simulateFailure: Boolean(simulateFailure),
      details
    });

    const isSuccess = payment.status === 'SUCCESS';
    return res.status(isSuccess ? 200 : 400).json({
      success: isSuccess,
      message: isSuccess
        ? 'Payment processed successfully'
        : 'Payment transaction failed (simulated failure test case)',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentByOrderId = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentByOrderId(
      req.params.orderId,
      req.user._id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: 'Payment information fetched successfully',
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentByOrderId
};
