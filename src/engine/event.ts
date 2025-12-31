import { Action } from './action';
import { Decision } from './decision';

export type Event = {
    action: Action;
    decision: Decision;
};
