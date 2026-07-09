export class InvalidSlotNameError extends Error {
    constructor(name: string, reason?: string) {
        super(`Invalid slot name '${name}'${reason ? `: ${reason}` : ''}`);
        this.name = 'InvalidSlotNameError';
    }
}
