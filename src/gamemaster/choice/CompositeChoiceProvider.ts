import { GameState } from '../../engine/state';
import { DeepReadonly } from '../../utils/types';
import { ChoiceProvider, OfferedChoice } from './ChoiceProvider';

export class CompositeChoiceProvider implements ChoiceProvider {
    constructor(private readonly providers: readonly ChoiceProvider[]) {}

    compute(state: DeepReadonly<GameState>): OfferedChoice[] {
        return this.providers.flatMap((provider) => provider.compute(state));
    }
}
