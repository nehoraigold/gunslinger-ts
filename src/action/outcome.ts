export type Outcome = {
    result: 'success' | 'failure' | 'error';
    reasons?: string[];
};
