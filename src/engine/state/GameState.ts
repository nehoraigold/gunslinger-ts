import { CombatState } from '../combat';
import { FlagStore } from '../flag/FlagStore';
import { Player } from '../player';
import { World } from '../world';

export interface GameState {
    player: Player;
    world: World;
    flags: FlagStore;

    // Non-null when a combat encounter is active.
    // Tools check this before executing combat actions.
    combat: CombatState | null;

    // Turn counter. Incremented after each complete turn.
    // Tools receive this via StateManager for timestamping.
    turnCount: number;
}
