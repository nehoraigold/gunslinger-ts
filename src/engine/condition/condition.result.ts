import { ConditionResultReason } from './conditionResultReason';

export type ConditionResult =
    | {
          ok: true;
          reasons?: ConditionResultReason[];
      }
    | {
          ok: false;
          reasons: ConditionResultReason[];
      };
