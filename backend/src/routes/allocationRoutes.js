import express from 'express';
import allocationController from '../controllers/allocationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', allocationController.getAllocations);
router.get('/:id', allocationController.getAllocationById);
router.post('/', authorize('ADMIN'), allocationController.createAllocation);
router.patch('/:id/return-request', authorize('EMPLOYEE'), allocationController.requestReturn);
router.patch('/:id/confirm-return', authorize('ADMIN'), allocationController.confirmReturn);

export default router;
