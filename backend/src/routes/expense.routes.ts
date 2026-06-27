import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { upload, handleMulterError } from '../middlewares/upload.middleware';
import { updateExpenseSchema, expenseIdParamSchema } from '../validators/expense.validator';

const router = Router();

router.use(authenticate);

router.get('/:expenseId', validate(expenseIdParamSchema, 'params'), expenseController.getExpense);
router.patch('/:expenseId', validate(expenseIdParamSchema, 'params'), validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:expenseId', validate(expenseIdParamSchema, 'params'), expenseController.deleteExpense);
router.post('/:expenseId/receipt', validate(expenseIdParamSchema, 'params'), upload.single('receipt'), handleMulterError, expenseController.uploadReceipt);

export default router;
