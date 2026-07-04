export class MaxRoundsExceededError extends Error {
    constructor(maxRounds: number) {
        super(`Turn exceeded the maximum of ${maxRounds} rounds`);
        this.name = 'MaxRoundsExceededError';
    }
}
