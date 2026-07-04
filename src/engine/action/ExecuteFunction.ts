import { Context } from '../context';

export type ExecuteFunction<InputT, OutcomeT> = (ctx: Context, input: InputT) => OutcomeT;
