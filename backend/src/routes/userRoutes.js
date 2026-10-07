import express from 'express';
import userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All user management routes require ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.updateUserStatus);

export default router;
