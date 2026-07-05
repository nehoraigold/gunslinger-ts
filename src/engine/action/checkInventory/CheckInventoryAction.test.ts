import { describe, it } from 'mocha';
import { expect } from 'chai';

import { CheckInventoryAction } from './CheckInventoryAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../entity';
import { GameState } from '../../state';

describe(CheckInventoryAction.name, () => {
    function createDefaultContext(modifyState?: ModifyState): Context {
        const state = createGameState(modifyState);
        return new GameContext(new GameTransaction(state), {
            room: new DefaultRoomFactory(),
            item: new DefaultItemFactory(),
        });
    }

    function withItemInInventory(itemId: string, quantity: number): (state: GameState) => void {
        return (state) => {
            state.player.inventory[itemId] = quantity;
        };
    }

    describe('execute', () => {
        it('should list each held item with its name and quantity', () => {
            const ctx = createDefaultContext(withItemInInventory('item_1', 3));
            const action = new CheckInventoryAction();

            const outcome = action.execute(ctx);

            expect(outcome).to.deep.equal({
                result: 'success',
                data: { items: [{ itemId: 'item_1', name: 'Item 1', quantity: 3 }] },
            });
        });

        it('should return an empty list when the player holds nothing', () => {
            const ctx = createDefaultContext();
            const action = new CheckInventoryAction();

            const outcome = action.execute(ctx);

            expect(outcome).to.deep.equal({ result: 'success', data: { items: [] } });
        });

        it('should fall back to the item id if no item definition is found', () => {
            const ctx = createDefaultContext(withItemInInventory('nonexistent_item', 1));
            const action = new CheckInventoryAction();

            const outcome = action.execute(ctx);

            expect(outcome).to.deep.equal({
                result: 'success',
                data: { items: [{ itemId: 'nonexistent_item', name: 'nonexistent_item', quantity: 1 }] },
            });
        });
    });

    describe('schema', () => {
        it('should accept no input', () => {
            expect(() => new CheckInventoryAction().schema.parse(undefined)).to.not.throw();
        });
    });
});
