import { Router } from 'express';
import { submitRating, getMyRating } from '../controllers/rating.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', submitRating);
router.get('/me', getMyRating);

export default router;
