export type Outcome = {
    result: 'success' | 'invalid' | 'no_change';
    reasons?: string[];
};
