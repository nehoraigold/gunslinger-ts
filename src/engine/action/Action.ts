import { z } from 'zod';
import { Context } from '../context';

export interface Action<InputT extends z.ZodSchema, OutcomeT extends z.ZodSchema> {
    readonly name: string;
    readonly inputSchema: InputT;
    readonly outcomeSchema: OutcomeT;
    execute(ctx: Context, input: z.infer<InputT>): z.infer<OutcomeT>;
}
