const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', allocationController.getAllocations);
router.get('/:id', allocationController.getAllocationById);
router.post('/', authorize('ADMIN'), allocationController.createAllocation);
router.patch('/:id/return-request', authorize('EMPLOYEE'), allocationController.requestReturn);
router.patch('/:id/confirm-return', authorize('ADMIN'), allocationController.confirmReturn);

module.exports = router;
