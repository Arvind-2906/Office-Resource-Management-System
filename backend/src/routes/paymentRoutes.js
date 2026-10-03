const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', paymentController.processPayment);
router.get('/:orderId', paymentController.getPaymentByOrderId);

module.exports = router;
