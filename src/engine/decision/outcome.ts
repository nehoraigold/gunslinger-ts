import { Reason } from '../reason';

export type Outcome = {
    result: 'success' | 'failure' | 'error';
    reasons?: Reason[];
};
