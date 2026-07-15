import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { createActionMap } from './actionCatalog';
import { DialogueService } from '../engine/service/dialogue';

describe(createActionMap.name, () => {
    it('should register every action with a non-empty description', () => {
        const dialogueService: DialogueService = { converseWith: sinon.stub(), endStaleConversation: sinon.stub() };

        const map = createActionMap(dialogueService);

        expect(Object.keys(map)).to.have.members([
            'move',
            'pickUp',
            'drop',
            'equip',
            'unequip',
            'checkInventory',
            'checkStatus',
            'look',
            'lookItem',
            'unlock',
            'lookNpc',
            'talkTo',
            'buy',
            'sell',
            'give',
        ]);
        Object.values(map).forEach((entry) => {
            expect(entry.action).to.exist;
            expect(entry.description).to.be.a('string').and.not.empty;
        });
    });
});
