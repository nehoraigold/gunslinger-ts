import { Context } from '../context';

export interface OnTickEffect {
    apply(context: Context): void;
}
