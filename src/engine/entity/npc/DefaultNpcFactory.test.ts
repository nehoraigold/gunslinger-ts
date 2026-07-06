import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultNpcFactory } from './DefaultNpcFactory';
import { DefaultNpc } from './DefaultNpc';
import { RootValueStore } from '../../store';
import { NpcState } from '../../state';

describe(DefaultNpcFactory.name, () => {
    describe('create', () => {
        it('should create a DefaultNpc with the given id and store', () => {
            const store = new RootValueStore<NpcState>({
                name: 'Old Marshal',
                appearance: 'A weathered lawman with a tin star.',
                dialogue: 'Trouble follows you, stranger.',
                money: 0,
            });
            const factory = new DefaultNpcFactory();

            const npc = factory.create('marshal', store);

            expect(npc).to.be.instanceOf(DefaultNpc);
            expect(npc.id).to.equal('marshal');
        });
    });
});
