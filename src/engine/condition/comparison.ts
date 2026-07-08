export type Comparison = 'at_least' | 'exactly' | 'at_most';

export const compare = (actual: number, comparison: Comparison, target: number): boolean => {
    switch (comparison) {
        case 'at_least':
            return actual >= target;
        case 'exactly':
            return actual === target;
        case 'at_most':
            return actual <= target;
    }
};
