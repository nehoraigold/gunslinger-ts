import { HealthProse } from '../combat';

const HEALTHY_RANGE = [80, 100] as const;
const BRUISED_RANGE = [60, 79] as const;
const WOUNDED_RANGE = [35, 59] as const;
const BATTERED_RANGE = [10, 34] as const;
const FATAL_RANGE = [0, 9] as const;

const HEALTH_RANGES: Record<HealthProse, readonly [number, number]> = {
    healthy: HEALTHY_RANGE,
    bruised: BRUISED_RANGE,
    wounded: WOUNDED_RANGE,
    battered: BATTERED_RANGE,
    fatal: FATAL_RANGE,
};

export const healthValueToProse = ({ health, maxHealth }: { health: number; maxHealth: number }): HealthProse => {
    const percentage = Math.ceil((health * 100) / maxHealth);
    for (let [prose, [min, max]] of Object.entries(HEALTH_RANGES)) {
        if (percentage >= min && percentage <= max) {
            return prose as HealthProse;
        }
    }
    throw new Error(
        `unable to determine health prose from health percentage ${percentage} (health: ${health}, maxHealth: ${maxHealth})`,
    );
};
