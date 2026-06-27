import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import groupRoutes from './group.routes';
import roomRoutes from './room.routes';
import expenseRoutes from './expense.routes';
import settlementRoutes from './settlement.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import ratingRoutes from './rating.routes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/rooms', roomRoutes);
router.use('/expenses', expenseRoutes);
router.use('/settlements', settlementRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ratings', ratingRoutes);

export default router;
