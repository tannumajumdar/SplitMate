import { Router } from 'express';
import * as groupController from '../controllers/group.controller';
import * as expenseController from '../controllers/expense.controller';
import * as settlementController from '../controllers/settlement.controller';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createGroupSchema,
  updateGroupSchema,
  joinGroupSchema,
  groupIdParamSchema,
} from '../validators/group.validator';
import {
  createExpenseSchema,
  expenseFilterSchema,
} from '../validators/expense.validator';
import { createSettlementSchema, settlementFilterSchema } from '../validators/settlement.validator';

const router = Router();

router.use(authenticate);

// Group CRUD
router.post('/', validate(createGroupSchema), groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.post('/join', validate(joinGroupSchema), groupController.joinGroup);

router.get('/:groupId', validate(groupIdParamSchema, 'params'), groupController.getGroup);
router.patch('/:groupId', validate(groupIdParamSchema, 'params'), validate(updateGroupSchema), groupController.updateGroup);
router.delete('/:groupId', validate(groupIdParamSchema, 'params'), groupController.deleteGroup);
router.post('/:groupId/leave', validate(groupIdParamSchema, 'params'), groupController.leaveGroup);
router.post('/:groupId/regenerate-code', validate(groupIdParamSchema, 'params'), groupController.regenerateInviteCode);
router.delete('/:groupId/members/:memberId', validate(groupIdParamSchema, 'params'), groupController.removeMember);

// Expenses under group
router.get('/:groupId/expenses', validate(groupIdParamSchema, 'params'), validate(expenseFilterSchema, 'query'), expenseController.getGroupExpenses);
router.post('/:groupId/expenses', validate(groupIdParamSchema, 'params'), validate(createExpenseSchema), expenseController.addExpense);

// Settlements under group
router.get('/:groupId/settlements', validate(groupIdParamSchema, 'params'), validate(settlementFilterSchema, 'query'), settlementController.getGroupSettlements);
router.post('/:groupId/settlements', validate(groupIdParamSchema, 'params'), validate(createSettlementSchema), settlementController.createSettlement);
router.get('/:groupId/balances', validate(groupIdParamSchema, 'params'), settlementController.getGroupBalances);

// Analytics under group
router.get('/:groupId/analytics', validate(groupIdParamSchema, 'params'), analyticsController.getGroupAnalytics);

export default router;
