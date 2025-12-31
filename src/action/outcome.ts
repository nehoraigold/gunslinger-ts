import { Reason } from '../engine/reason';

export type Outcome = {
    result: 'success' | 'failure' | 'error';
    reasons?: Reason[];
};
