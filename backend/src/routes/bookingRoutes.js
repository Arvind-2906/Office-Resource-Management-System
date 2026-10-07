import express from 'express';
import bookingController from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;
