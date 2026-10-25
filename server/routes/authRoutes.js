import { Router } from 'express';
import { createReceptionist, currentUser, listStaff, login, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(currentUser));
router.get('/staff', requireAuth, requireRole('Admin'), asyncHandler(listStaff));
router.post('/staff', requireAuth, requireRole('Admin'), asyncHandler(createReceptionist));

export default router;