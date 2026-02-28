import ora from 'ora';

export interface Spinner {
    stop(): void;
}

export function startSpinner(): Spinner {
    return ora('').start();
}
