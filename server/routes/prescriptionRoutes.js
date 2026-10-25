import { Router } from 'express';
import { createPrescription, listPrescriptions } from '../controllers/prescriptionController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/', requireRole('Admin', 'Doctor', 'Patient'), asyncHandler(listPrescriptions));
router.post('/', requireRole('Doctor'), asyncHandler(createPrescription));

export default router;