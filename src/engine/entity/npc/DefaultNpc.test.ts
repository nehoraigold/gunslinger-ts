import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultNpc } from './DefaultNpc';
import { RootValueStore } from '../../store';
import { NpcState } from '../../state';

describe(DefaultNpc.name, () => {
    function createDefaultNpc(state?: Partial<NpcState>): DefaultNpc {
        const store = new RootValueStore<NpcState>({
            name: 'Old Marshal',
            appearance: 'A weathered lawman with a tin star and a limp.',
            dialogue: 'Trouble follows you, stranger.',
            ...state,
        });
        return new DefaultNpc('marshal', store);
    }

    describe('id', () => {
        it('should return the id of the npc', () => {
            const npc = createDefaultNpc();

            expect(npc.id).to.equal('marshal');
        });
    });

    describe('name', () => {
        it('should return the name from the npc state', () => {
            const npc = createDefaultNpc({ name: 'Old Marshal' });

            expect(npc.name).to.equal('Old Marshal');
        });
    });

    describe('appearance', () => {
        it('should return the appearance from the npc state', () => {
            const npc = createDefaultNpc({ appearance: 'A weathered lawman.' });

            expect(npc.appearance).to.equal('A weathered lawman.');
        });
    });

    describe('dialogue', () => {
        it('should return the dialogue line from the npc state', () => {
            const npc = createDefaultNpc({ dialogue: 'Trouble follows you, stranger.' });

            expect(npc.dialogue).to.equal('Trouble follows you, stranger.');
        });
    });
});
