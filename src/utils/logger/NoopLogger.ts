import { Logger } from './Logger';

class NoopLogger implements Logger {
    debug(): void {}
    info(): void {}
    warn(): void {}
    error(): void {}
}

export const noopLogger: Logger = new NoopLogger();
