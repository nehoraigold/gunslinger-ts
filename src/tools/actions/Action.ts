// import { z } from 'zod';
// import { getLogger } from '../../utils';
// import { defineActionOutcome } from './ActionOutcome';
//
// export type ExecuteFn<InputT, OutputT> = (task: InputT) => OutputT | Promise<OutputT>;
//
// export class Action<InputT extends z.ZodTypeAny = any, OutputT extends z.ZodTypeAny = any> {
//     public readonly name: string;
//     public readonly description: string;
//     public readonly inputSchema: InputT;
//     private readonly outputSchema: OutputT;
//     private readonly run: ExecuteFn<z.infer<InputT>, z.infer<OutputT>>;
//     private readonly logger: ReturnType<typeof getLogger>;
//
//     constructor(opts: {
//         name: string;
//         description: string;
//         inputSchema: InputT;
//         outputSchema: OutputT;
//         run: ExecuteFn<z.infer<InputT>, z.infer<OutputT>>;
//     }) {
//         this.name = opts.name;
//         this.description = opts.description;
//         this.inputSchema = opts.inputSchema;
//         this.outputSchema = opts.outputSchema;
//         this.run = opts.run;
//         this.logger = getLogger(this.name);
//     }
//
//     private normalize(raw: unknown): z.infer<InputT> {
//         return this.inputSchema.parse(raw);
//     }
//
//     public async execute(raw: unknown): Promise<z.infer<OutputT>> {
//         try {
//             const input = this.normalize(raw);
//             const result = await this.run(input);
//             return this.outputSchema.parse(result);
//         } catch (e) {
//             this.logger.error(`Error executing action - raw: ${JSON.stringify(raw)}, error: ${e}`);
//             return { success: false, error: e?.toString() };
//         }
//     }
// }
//
// export function defineAction<
//     Name extends string,
//     InputSchema extends z.ZodTypeAny,
//     OutputSchema extends z.ZodTypeAny = z.ZodOptional<z.ZodVoid>,
// >(opts: {
//     name: Name;
//     description: string;
//     inputSchema: InputSchema;
//     outputSchema?: OutputSchema;
//     run: ExecuteFn<z.infer<InputSchema>, z.infer<ReturnType<typeof defineActionOutcome<OutputSchema>>>>;
// }) {
//     const resultSchema = opts.outputSchema ? defineResult(opts.outputSchema) : defineResult();
//     return new Action({
//         name: opts.name,
//         description: opts.description,
//         inputSchema,
//         resultSchema,
//         run: opts.run,
//     });
// }
