import { DeepReadonly } from '../../../utils/types';

export interface ValueStore<T> {
    get(): DeepReadonly<T>;
    update(updateFn: (draft: T) => void): void;
}
