import { Router } from 'express';
import * as roomController from '../controllers/room.controller';
import * as roomExpenseController from '../controllers/roomExpense.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createRoomSchema, addMemberSchema, updateMemberSchema } from '../validators/room.validator';

const router = Router();

router.use(authenticate);

// ─── Room CRUD ───────────────────────────────────────────────────────────────
router.post('/', validate(createRoomSchema), roomController.createRoom);
router.get('/', roomController.getRooms);
router.get('/:roomId', roomController.getRoom);
router.delete('/:roomId', roomController.deleteRoom);

// ─── Room Members ────────────────────────────────────────────────────────────
router.get('/:roomId/members', roomController.getMembers);
router.post('/:roomId/members', validate(addMemberSchema), roomController.addMember);
router.patch('/:roomId/members/:memberId', validate(updateMemberSchema), roomController.updateMember);
router.delete('/:roomId/members/:memberId', roomController.deleteMember);

// ─── Room Expenses ───────────────────────────────────────────────────────────
router.get('/:roomId/expenses', roomExpenseController.getExpenses);
router.post('/:roomId/expenses', roomExpenseController.createExpense);
router.patch('/:roomId/expenses/:expenseId', roomExpenseController.updateExpense);
router.delete('/:roomId/expenses/:expenseId', roomExpenseController.deleteExpense);

export default router;
