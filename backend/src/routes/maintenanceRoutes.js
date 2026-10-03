const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', maintenanceController.getMaintenanceList);
router.get('/:id', maintenanceController.getMaintenanceById);
router.post('/', maintenanceController.reportMaintenance);
router.patch('/:id/status', authorize('ADMIN'), maintenanceController.updateMaintenanceStatus);

module.exports = router;
