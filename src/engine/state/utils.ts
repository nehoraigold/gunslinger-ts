import { HealthProse } from '../combat';

export const healthValueToProse = ({ health, maxHealth }: { health: number; maxHealth: number }): HealthProse => {
    const percentage = Math.ceil((health * 100) / maxHealth);
    const ranges: Record<HealthProse, [number, number]> = {
        healthy: [80, 100],
        bruised: [60, 79],
        wounded: [35, 59],
        battered: [10, 34],
        fatal: [0, 9],
    };
    for (let [prose, [min, max]] of Object.entries(ranges)) {
        if (percentage >= min && percentage <= max) {
            return prose as HealthProse;
        }
    }
    throw new Error(
        `unable to determine health prose from health percentage ${percentage} (health: ${health}, maxHealth: ${maxHealth})`,
    );
};
