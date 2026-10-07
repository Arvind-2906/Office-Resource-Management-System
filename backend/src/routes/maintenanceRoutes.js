import express from 'express';
import maintenanceController from '../controllers/maintenanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', maintenanceController.getMaintenanceList);
router.get('/:id', maintenanceController.getMaintenanceById);
router.post('/', maintenanceController.reportMaintenance);
router.patch('/:id/status', authorize('ADMIN'), maintenanceController.updateMaintenanceStatus);

export default router;
