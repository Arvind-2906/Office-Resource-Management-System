const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { createOrderValidator } = require('../validators/orderValidator');
const { validate } = require('../middleware/validationMiddleware');

router.use(protect);

router.post('/', createOrderValidator, validate, orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
