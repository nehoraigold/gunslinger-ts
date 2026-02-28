import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

const ConfigSchema = z.object({
    /** Claude model to use when provider is Anthropic. */
    anthropicModel: z.string().optional().default('claude-sonnet-4-6'),
    /** Ollama model name. When set, the Ollama provider is used instead of Anthropic. */
    ollamaModel: z.string().optional().default('gpt-oss:20b'),
    /** Ollama server base URL. */
    ollamaHost: z.string().default('http://localhost:11434'),
    /** Maximum tokens for LLM responses. */
    maxTokens: z.number().int().positive().default(2048),
    /** Logger verbosity. */
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('error'),
    /** Directory for save files. */
    savePath: z.string().default('./saves'),
    /** Path for the debug log file (overwritten each session). */
    logPath: z.string().default('./debug.log'),
});

export type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
    let fileConfig: Record<string, unknown> = {};

    try {
        const raw = readFileSync(join(process.cwd(), 'config.local.json'), 'utf-8');
        fileConfig = JSON.parse(raw);
    } catch {
        // No config file — env vars and defaults will be used.
    }

    // Env vars take precedence over file config.
    const merged: Record<string, unknown> = {
        ...fileConfig,
        ...(process.env.ANTHROPIC_MODEL ? { anthropicModel: process.env.ANTHROPIC_MODEL } : {}),
        ...(process.env.OLLAMA_MODEL ? { ollamaModel: process.env.OLLAMA_MODEL } : {}),
        ...(process.env.OLLAMA_HOST ? { ollamaHost: process.env.OLLAMA_HOST } : {}),
        ...(process.env.MAX_TOKENS ? { maxTokens: parseInt(process.env.MAX_TOKENS, 10) } : {}),
        ...(process.env.LOG_LEVEL ? { logLevel: process.env.LOG_LEVEL } : {}),
        ...(process.env.SAVE_PATH ? { savePath: process.env.SAVE_PATH } : {}),
        ...(process.env.LOG_PATH ? { logPath: process.env.LOG_PATH } : {}),
    };

    return ConfigSchema.parse(merged);
}

export const config = loadConfig();
