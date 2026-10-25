import { Router } from 'express';
import { createAppointment, listAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(listAppointments));
router.post('/', requireRole('Patient', 'Admin', 'Receptionist'), asyncHandler(createAppointment));
router.patch('/:id/status', requireRole('Admin', 'Doctor', 'Patient', 'Receptionist'), asyncHandler(updateAppointmentStatus));

export default router;