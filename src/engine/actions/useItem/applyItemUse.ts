import { GameState } from '../../state/GameState';

export function applyItemUse(
    draft: GameState,
    itemId: string,
    quantity: number,
    consumedOnUse: boolean,
    turnCount: number,
): void {
    if (consumedOnUse) {
        const newQty = quantity - 1;
        if (newQty === 0) {
            delete draft.player.inventory[itemId];
        } else {
            draft.player.inventory[itemId] = newQty;
        }
    }
    draft.world.items[itemId].lastInteractedTurn = turnCount;
}
