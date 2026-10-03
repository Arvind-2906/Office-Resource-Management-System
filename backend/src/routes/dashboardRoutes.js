const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/admin', authorize('ADMIN'), dashboardController.getAdminDashboard);
router.get('/employee', authorize('EMPLOYEE', 'ADMIN'), dashboardController.getEmployeeDashboard);

module.exports = router;
