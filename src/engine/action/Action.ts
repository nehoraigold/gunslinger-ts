import { z } from 'zod';
import { Context } from '../context';
import { Parser } from '../../utils/parser';

export interface Action<InputT, OutcomeT extends { result: 'success' | 'failure' }> {
    readonly name: string;
    readonly inputSchema: z.ZodSchema<InputT>;
    readonly outcomeSchema: z.ZodSchema<OutcomeT>;
    readonly inputParser: Parser<InputT>;
    execute(ctx: Context, input: InputT): OutcomeT;
}
