import { z } from 'zod';
import { Context } from '../context';
import { Schema } from '../../utils/schema';

export interface Action<InputT, OutcomeT extends { result: 'success' | 'failure' }> {
    readonly name: string;
    readonly schema: Schema<InputT>;
    readonly outcomeSchema: z.ZodSchema<OutcomeT>;
    execute(ctx: Context, input: InputT): OutcomeT;
}
