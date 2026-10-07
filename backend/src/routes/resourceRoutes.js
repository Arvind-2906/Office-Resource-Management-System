import express from 'express';
import resourceController from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);

// Admin-only endpoints
router.post('/', authorize('ADMIN'), resourceController.createResource);
router.put('/:id', authorize('ADMIN'), resourceController.updateResource);
router.patch('/:id/status', authorize('ADMIN'), resourceController.updateResourceStatus);
router.delete('/:id', authorize('ADMIN'), resourceController.deleteResource);

export default router;
