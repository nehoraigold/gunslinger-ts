import { Context } from '../context';

export interface OnTurnEffect {
    apply(context: Context): void;
}
