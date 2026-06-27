import { Request, Response } from 'express';
import { settlementService } from '../services/settlement.service';
import { balanceService } from '../services/balance.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { CreateSettlementInput } from '../validators/settlement.validator';

export const createSettlement = asyncHandler(async (req: Request, res: Response) => {
  const settlement = await settlementService.createSettlement(
    req.userId!,
    req.body as CreateSettlementInput
  );
  ApiResponse.created(res, { settlement }, 'Settlement created');
});

export const getSettlement = asyncHandler(async (req: Request, res: Response) => {
  const settlement = await settlementService.getSettlement(
    req.params.settlementId,
    req.userId!
  );
  ApiResponse.success(res, { settlement });
});

export const getGroupSettlements = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query as Record<string, string>;
  const result = await settlementService.getGroupSettlements(
    req.params.groupId,
    req.userId!,
    page,
    limit,
    status
  );
  ApiResponse.paginated(res, result.data, result.pagination);
});

export const getPendingSettlements = asyncHandler(async (req: Request, res: Response) => {
  const settlements = await settlementService.getPendingSettlements(req.userId!);
  ApiResponse.success(res, { settlements });
});

export const markSettlementPaid = asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.body as { transactionId?: string };
  const settlement = await settlementService.markSettlementPaid(
    req.params.settlementId,
    req.userId!,
    transactionId
  );
  ApiResponse.success(res, { settlement }, 'Settlement marked as paid');
});

export const cancelSettlement = asyncHandler(async (req: Request, res: Response) => {
  const settlement = await settlementService.cancelSettlement(
    req.params.settlementId,
    req.userId!
  );
  ApiResponse.success(res, { settlement }, 'Settlement cancelled');
});

export const getGroupBalances = asyncHandler(async (req: Request, res: Response) => {
  const data = await balanceService.getGroupBalances(req.params.groupId, req.userId!);
  ApiResponse.success(res, data);
});

export const getMyOverallBalance = asyncHandler(async (req: Request, res: Response) => {
  const data = await balanceService.getUserOverallBalance(req.userId!);
  ApiResponse.success(res, data);
});
