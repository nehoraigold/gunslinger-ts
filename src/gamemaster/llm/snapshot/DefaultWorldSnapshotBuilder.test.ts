import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultWorldSnapshotBuilder } from './DefaultWorldSnapshotBuilder';
import { createGameState } from '../../../engine/state/GameState.test.utils';

describe(DefaultWorldSnapshotBuilder.name, () => {
    const builder = new DefaultWorldSnapshotBuilder();

    describe('build', () => {
        it("should include the current room's name and description", () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.include('Room 1');
            expect(snapshot).to.include('The first room');
        });

        it('should list each unblocked exit by direction only', () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/west(?!.*blocked)/);
        });

        it('should note the block reason for a blocked exit', () => {
            const state = createGameState((s) => {
                s.rooms.room_1.exits = [
                    {
                        direction: 'west',
                        destinationRoomId: 'room_2',
                        lock: { keyItemId: 'iron_key', isLocked: true, consumesKey: false },
                    },
                ];
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/west.*blocked.*door_locked/);
        });

        it('should report no exits when the room has none', () => {
            const state = createGameState((s) => {
                s.rooms.room_1.exits = [];
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.include('none');
        });

        it('should show both equipment slots as none when nothing is equipped', () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/weapon: none/);
            expect(snapshot).to.match(/armor: none/);
        });

        it("should show the equipped item's name when a slot is filled", () => {
            const state = createGameState((s) => {
                s.player.equipment.weapon = 'item_1';
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/weapon: Item 1/);
        });

        it('should report no items when the current room holds nothing', () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/ITEMS HERE:\s*none/);
        });

        it('should list an item held in the current room by name, quantity, and id', () => {
            const state = createGameState((s) => {
                s.rooms.room_1.inventory = { item_1: 2 };
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/ITEMS HERE:\s*Item 1 x2 \(id: item_1\)/);
        });

        it('should report no people when the current room holds no npcs', () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/PEOPLE HERE:\s*none/);
        });

        it('should list an npc present in the current room by name and id', () => {
            const state = createGameState((s) => {
                s.rooms.room_1.npcIds = ['npc_1'];
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/PEOPLE HERE:\s*Npc 1 \(id: npc_1\)/);
        });

        it('should surface a merchant npc’s for-sale wares and buy interest', () => {
            const state = createGameState((s) => {
                s.rooms.room_1.npcIds = ['npc_1'];
                s.npcs.npc_1.shop = {
                    inventory: { item_1: 2 },
                    listings: { item_1: { price: 7, forSale: true } },
                    buys: ['consumable'],
                };
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.include('sells Item 1 x2 @ 7 (id: item_1)');
            expect(snapshot).to.include('buys item types: consumable');
        });

        it('should not surface shop details for a non-merchant npc', () => {
            const state = createGameState((s) => {
                s.rooms.room_1.npcIds = ['npc_1'];
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.not.include('sells');
        });

        it('should report nothing carried when the player holds no items', () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/CARRIED:\s*none/);
        });

        it('should list an item held by the player by name, quantity, and id', () => {
            const state = createGameState((s) => {
                s.player.inventory = { item_1: 3 };
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/CARRIED:\s*Item 1 x3 \(id: item_1\)/);
        });
    });
});
