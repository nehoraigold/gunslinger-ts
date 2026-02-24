import { z } from 'zod';

export const defineToolResult = <OutputT extends z.ZodSchema>(outputSchema: OutputT) => {
    return z.discriminatedUnion('ok', [
        z.object({
            ok: z.literal(true).describe('The intended action was successfully executed'),
            data: outputSchema,
        }),
        z.object({
            ok: z.literal(false).describe('The intended action failed'),
            error: z.object({
                code: z.enum(['INTERNAL_ERROR']).describe('The reason for the failure'),
                message: z.string().optional().describe('Additional information about the failure'),
            }),
        }),
    ]);
};

export type ToolResult<OutputT extends z.ZodSchema> = z.infer<ReturnType<typeof defineToolResult<OutputT>>>;
