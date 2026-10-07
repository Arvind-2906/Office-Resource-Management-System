import express from 'express';
import requestController from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);
router.post('/', authorize('EMPLOYEE'), requestController.createRequest);

// Admin-only approval and rejection
router.patch('/:id/approve', authorize('ADMIN'), requestController.approveRequest);
router.patch('/:id/reject', authorize('ADMIN'), requestController.rejectRequest);

export default router;
