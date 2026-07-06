import { Context } from '../context';

export interface TurnSystem {
    run(context: Context): void;
}
