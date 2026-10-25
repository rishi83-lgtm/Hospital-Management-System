import { Router } from 'express';
import { createPatient, getMyPatientRecord, listPatients } from '../controllers/patientController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/me', requireAuth, requireRole('Patient'), asyncHandler(getMyPatientRecord));
router.get('/', requireAuth, requireRole('Admin', 'Doctor', 'Receptionist'), asyncHandler(listPatients));
router.post('/', requireAuth, requireRole('Admin', 'Receptionist'), asyncHandler(createPatient));

export default router;