import { DeepReadonly } from './DeepReadonly';

export function cloneMutable<T>(value: DeepReadonly<T>): T {
    return structuredClone(value) as T;
}
