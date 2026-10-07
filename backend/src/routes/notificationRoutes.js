import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
