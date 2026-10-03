const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Activity logs are viewable by ADMIN only
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', activityController.getActivityLogs);

module.exports = router;
