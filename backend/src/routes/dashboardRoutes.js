import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('ADMIN'), dashboardController.getAdminDashboard);
router.get('/employee', authorize('EMPLOYEE', 'ADMIN'), dashboardController.getEmployeeDashboard);

export default router;
