const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);
router.post('/', authorize('EMPLOYEE'), requestController.createRequest);

// Admin-only approval and rejection
router.patch('/:id/approve', authorize('ADMIN'), requestController.approveRequest);
router.patch('/:id/reject', authorize('ADMIN'), requestController.rejectRequest);

module.exports = router;
