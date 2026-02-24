// Ambient detail entry. Rotates to reward repeated examination.
import { FlagValue } from '../flag';

export interface AmbientDetail {
    content: string;
    condition?: {
        // Optional: only surfaces when condition is met
        type: 'flag' | 'turn_range' | 'always';
        flagKey?: string;
        flagValue?: FlagValue;
        minTurn?: number;
        maxTurn?: number;
    };
}
