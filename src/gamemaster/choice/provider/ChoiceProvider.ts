import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';
import { ActionInvocation } from '../../dispatch';

export type AvailableChoice = {
    id: string;
    label: string;
};

export type OfferedChoice = {
    choice: AvailableChoice;
    invocation: ActionInvocation;
};

export interface ChoiceProvider {
    compute(state: DeepReadonly<GameState>): OfferedChoice[];
}
