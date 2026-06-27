import { Router } from 'express';
import * as settlementController from '../controllers/settlement.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { settlementIdParamSchema } from '../validators/settlement.validator';

const router = Router();

router.use(authenticate);

router.get('/pending', settlementController.getPendingSettlements);
router.get('/my-balance', settlementController.getMyOverallBalance);
router.get('/:settlementId', validate(settlementIdParamSchema, 'params'), settlementController.getSettlement);
router.post('/:settlementId/pay', validate(settlementIdParamSchema, 'params'), settlementController.markSettlementPaid);
router.post('/:settlementId/cancel', validate(settlementIdParamSchema, 'params'), settlementController.cancelSettlement);

export default router;
