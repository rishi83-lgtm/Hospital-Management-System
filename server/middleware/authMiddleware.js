import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return next(new Error('JWT_SECRET must be configured with at least 32 characters.'));
  }

  try {
    const payload = jwt.verify(authorization.slice(7), secret);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user || user.status !== 'Active') {
      return res.status(401).json({ message: 'The account is unavailable.' });
    }
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'The authentication token is invalid or expired.' });
    }
    return next(error);
  }
}