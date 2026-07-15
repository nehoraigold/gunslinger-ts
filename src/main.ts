import { AppConfig, buildGameApp } from './app';
import { TerminalDriver } from './cli';
import { configureLogging, closeLogging, ConsoleLogSink, parseLogLevel } from './utils/logger';

const config: AppConfig = {
    ollamaHost: process.env.OLLAMA_HOST,
    ollamaModel: process.env.OLLAMA_MODEL ?? 'gpt-oss:20b',
    saveDir: process.env.SAVE_DIR ?? './saves',
};

configureLogging({
    level: parseLogLevel(process.env.LOG_LEVEL, 'info'),
    sink: new ConsoleLogSink(),
});

const app = buildGameApp(config);
const driver = new TerminalDriver(app, { onBeforeExit: closeLogging });

void driver.run().then(() => {
    process.exit(0);
});
