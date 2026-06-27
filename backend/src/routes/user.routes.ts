import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { upload, handleMulterError } from '../middlewares/upload.middleware';
import { updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.post('/me/avatar', upload.single('avatar'), handleMulterError, userController.uploadAvatar);
router.delete('/me/avatar', userController.deleteAvatar);
router.get('/search', userController.searchUsers);
router.delete('/me', userController.deleteAccount);

export default router;
