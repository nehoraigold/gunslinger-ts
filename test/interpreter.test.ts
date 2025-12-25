import { describe, it } from 'mocha';
import { expect } from 'chai';

import { Action, ActionType, UnknownAction } from '../src/action';
import { ActionInterpreter } from '../src/interpreter';
import { GameState, initializeGameState } from '../src/engine';

type InterpreterTestCase = {
    name: string;
    prompt: string;
    state: GameState;
    expected: Partial<Action>;
};

const state = initializeGameState();

const MOVE_TEST_CASES: InterpreterTestCase[] = [
    {
        name: 'should return move action for clear case',
        prompt: 'move north',
        state,
        expected: { type: ActionType.MOVE, data: { direction: 'north' } },
    },
    {
        name: 'should be tolerant of noise',
        prompt: "I guess I'll walk toward the east now",
        state,
        expected: { type: ActionType.MOVE, data: { direction: 'east' } },
    },
    {
        name: 'should handle abbreviations',
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
        name: 'should return unknown action for unsupported intent',
        prompt: 'I talk to the dragon',
        state,
        unknownReason: 'unsupported',
    },
    {
        name: 'should return unknown action for ambiguous input',
        prompt: 'do it',
        state,
        unknownReason: 'ambiguous',
    },
    {
        name: 'should return unknown if action references entities not in state',
        prompt: 'read the sign',
        state,
        unknownReason: 'unsupported',
    },
];

const LOOK_TEST_CASES: Omit<InterpreterTestCase, 'expected'>[] = [
    {
        name: 'should return look for the word "look"',
        prompt: 'look',
        state,
    },
    {
        name: 'should return look for more verbose language',
        prompt: 'I examine the room carefully...',
        state,
    },
];

describe('ActionInterpreter', () => {
    const interpreter = new ActionInterpreter();
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
