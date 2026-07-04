import { GameState } from '../engine/state';

export function createSampleWorldState(): GameState {
    return {
        player: {
            id: 'player',
            name: 'Adventurer',
            currentRoomId: 'entrance',
            equipment: { weapon: undefined, armor: undefined },
        },
        items: {},
        rooms: {
            entrance: {
                name: 'Entrance Hall',
                description: 'A dusty entrance hall.',
                exits: [{ direction: 'north', destinationRoomId: 'chamber' }],
            },
            chamber: {
                name: 'Inner Chamber',
                description: 'A quiet inner chamber.',
                exits: [{ direction: 'south', destinationRoomId: 'entrance' }],
            },
        },
    };
}
