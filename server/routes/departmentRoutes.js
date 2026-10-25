import { Router } from 'express';
import { createDepartment, listDepartments } from '../controllers/departmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(listDepartments));
router.post('/', requireAuth, requireRole('Admin'), asyncHandler(createDepartment));

export default router;
