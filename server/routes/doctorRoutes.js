import { Router } from 'express';
import { createDoctor, listDoctors, updateMyAvailability } from '../controllers/doctorController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(listDoctors));
router.post('/', requireAuth, requireRole('Admin'), asyncHandler(createDoctor));
router.patch('/me/availability', requireAuth, requireRole('Doctor'), asyncHandler(updateMyAvailability));

export default router;