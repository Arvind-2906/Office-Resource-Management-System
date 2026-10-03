const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);

// Admin-only endpoints
router.post('/', authorize('ADMIN'), resourceController.createResource);
router.put('/:id', authorize('ADMIN'), resourceController.updateResource);
router.patch('/:id/status', authorize('ADMIN'), resourceController.updateResourceStatus);
router.delete('/:id', authorize('ADMIN'), resourceController.deleteResource);

module.exports = router;
