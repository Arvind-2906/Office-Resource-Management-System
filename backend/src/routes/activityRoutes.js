import express from 'express';
import activityController from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Activity logs are viewable by ADMIN only
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', activityController.getActivityLogs);

export default router;
