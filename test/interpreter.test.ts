import { describe, it } from 'mocha';
import { expect } from 'chai';

import { Action, ActionType, UnknownAction } from '../src/action';
import { Interpreter } from '../src/interpreter';
import { GameState, testGameState } from '../src/engine';

type InterpreterTestCase = {
    name: string;
    prompt: string;
    state: GameState;
    expected: Partial<Action>;
};

const state = testGameState();

const MOVE_TEST_CASES: InterpreterTestCase[] = [
    {
        name: 'should return move action for clear case',
        prompt: 'move north',
        state,
        expected: { type: ActionType.MOVE, data: { direction: 'north' } },
    },
    {
        name: 'should return move action with noisy input',
        prompt: "I guess I'll walk toward the east now",
        state,
        expected: { type: ActionType.MOVE, data: { direction: 'east' } },
    },
    {
        name: 'should return move action with abbreviations',
        prompt: 'walk S',
        state,
        expected: { type: ActionType.MOVE, data: { direction: 'south' } },
    },
];

const UNKNOWN_TEST_CASES: Omit<
    InterpreterTestCase & { unknownReason?: UnknownAction['data']['reason'] },
    'expected'
>[] = [
    {
        name: 'should return unknown action for empty prompt',
        prompt: '',
        state,
    },
    {
        name: 'should return unknown action for unparsable input',
        prompt: 'a;dlfkjaghdufenvadhjfh3487624398fhcjcasdfkj',
        state,
        unknownReason: 'unparsable',
    },
    {
        name: 'should return unknown action for actions that deviate from state',
        prompt: 'I talk to the dragon',
        state,
        unknownReason: 'unsupported',
    },
    {
        name: 'should return unknown action for unsupported direction',
        prompt: 'I walk southeast',
        state,
        unknownReason: 'unsupported',
    },
    {
        name: 'should return unknown action for ambiguous input',
        prompt: 'do it',
        state,
        unknownReason: 'ambiguous',
    },
];

const LOOK_TEST_CASES: Omit<InterpreterTestCase, 'expected'>[] = [
    {
        name: 'should return look action for the word "look"',
        prompt: 'look',
        state,
    },
    {
        name: 'should return look for more verbose language',
        prompt: 'I examine the room carefully...',
        state,
    },
];

const TRANSFER_TEST_CASES: InterpreterTestCase[] = [
    {
        name: 'take single item by name',
        prompt: 'take coin',
        state,
        expected: {
            type: ActionType.TRANSFER,
            data: {
                item: 'coin',
                from: 'room',
                to: 'player',
                quantity: 1,
            },
        },
    },
    {
        name: 'take multiple items by explicit quantity',
        prompt: 'take 2 coins',
        state,
        expected: {
            type: ActionType.TRANSFER,
            data: {
                item: 'coin',
                from: 'room',
                to: 'player',
                quantity: 2,
            },
        },
    },
    {
        name: 'take all items',
        prompt: 'take all coins',
        state,
        expected: {
            type: ActionType.TRANSFER,
            data: {
                item: 'coin',
                from: 'room',
                to: 'player',
            },
        },
    },
];

describe('ActionInterpreter', () => {
    const interpreter = new Interpreter();
    describe('parse', () => {
        describe('move action', () => {
            MOVE_TEST_CASES.forEach(({ name, expected, prompt, state }) => {
                it(name, async () => {
                    // act
                    const action = await interpreter.parse(prompt, state);

                    // assert
                    expect(action).to.deep.equal(expected);
                });
            });
        });

        describe('unknown action', () => {
            UNKNOWN_TEST_CASES.forEach(({ name, prompt, state, unknownReason }) => {
                it(name, async () => {
                    // act
                    const action = await interpreter.parse(prompt, state);

                    // assert
                    expect(action.type).to.equal(ActionType.UNKNOWN);
                    if (unknownReason) {
                        expect((action as UnknownAction).data.reason).to.equal(unknownReason);
                    }
                });
            });
        });

        describe('look action', () => {
            LOOK_TEST_CASES.forEach(({ name, prompt, state }) => {
                it(name, async () => {
                    // act
                    const action = await interpreter.parse(prompt, state);

                    // assert
                    expect(action.type).to.equal(ActionType.LOOK);
                });
            });
        });
    });
});
