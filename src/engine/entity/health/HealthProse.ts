export type HealthProse = 'healthy' | 'bruised' | 'wounded' | 'battered' | 'fatal';

export function deriveHealthProse(current: number, max: number): HealthProse {
    if (current <= 0) {
        return 'fatal';
    }
    const ratio = current / max;
    if (ratio < 0.35) {
        return 'battered';
    }
    if (ratio < 0.6) {
        return 'wounded';
    }
    if (ratio < 1) {
        return 'bruised';
    }
    return 'healthy';
}
