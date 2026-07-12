import { describe, it } from 'mocha';
import { expect } from 'chai';

import { CheckStatusAction } from './CheckStatusAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { GameState } from '../../state';

describe(CheckStatusAction.name, () => {
    function createDefaultContext(modifyState?: ModifyState): Context {
        const state = createGameState(modifyState);
        return new GameContext(new GameTransaction(state), {
            room: new DefaultRoomFactory(),
            item: new DefaultItemFactory(),
            npc: new DefaultNpcFactory(),
        });
    }

    function withHealth(current: number, max: number): (state: GameState) => void {
        return (state) => {
            state.player.health = { current, max };
        };
    }

    describe('execute', () => {
        it('should report healthy at full health', () => {
            const ctx = createDefaultContext(withHealth(20, 20));
            const action = new CheckStatusAction();

            const outcome = action.execute(ctx);

            expect(outcome).to.deep.equal({ result: 'success', data: { health: 'healthy' } });
        });

        it('should report wounded around mid health', () => {
            const ctx = createDefaultContext(withHealth(10, 20));
            const action = new CheckStatusAction();

            const outcome = action.execute(ctx);

            expect(outcome).to.deep.equal({ result: 'success', data: { health: 'wounded' } });
        });

        it('should report fatal at zero health', () => {
            const ctx = createDefaultContext(withHealth(0, 20));
            const action = new CheckStatusAction();

            const outcome = action.execute(ctx);

            expect(outcome).to.deep.equal({ result: 'success', data: { health: 'fatal' } });
        });
    });

    describe('schema', () => {
        it('should accept no input', () => {
            expect(() => new CheckStatusAction().schema.parse(undefined)).to.not.throw();
        });
    });
});
