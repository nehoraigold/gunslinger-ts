import { GameState } from '../engine/state';

export function createSampleWorldState(): GameState {
    return {
        player: {
            id: 'player',
            name: 'Adventurer',
            currentRoomId: 'entrance',
            equipment: { weapon: undefined, armor: undefined },
            inventory: {},
        },
        items: {
            coins: {
                name: 'Coins',
                description: 'A handful of tarnished silver coins.',
                type: 'misc',
                stackable: true,
            },
            iron_key: {
                name: 'Iron Key',
                description: 'A small iron key, its teeth worn smooth with age.',
                type: 'key',
                stackable: false,
            },
        },
        rooms: {
            tower: {
                name: 'Crumbling Tower',
                lightLevel: 'dim',
                visited: false,
                description:
                    'A spiral stair climbs into a tower whose upper floors have long since collapsed. Rusted ' +
                    'weapon racks line the wall, empty but for cobwebs. An iron key glints atop one of the racks.',
                exits: [
                    { direction: 'south', destinationRoomId: 'armory' },
                    { direction: 'east', destinationRoomId: 'rampart' },
                ],
                inventory: { iron_key: 1 },
            },
            rampart: {
                name: 'North Rampart',
                lightLevel: 'bright',
                visited: false,
                description:
                    'A narrow walkway runs along the top of the outer wall. Gaps where stones have fallen away ' +
                    'offer a long drop to the courtyard below.',
                exits: [
                    { direction: 'west', destinationRoomId: 'tower' },
                    { direction: 'south', destinationRoomId: 'courtyard' },
                    { direction: 'east', destinationRoomId: 'stairwell' },
                ],
                inventory: {},
            },
            stairwell: {
                name: 'Collapsed Stairwell',
                lightLevel: 'dim',
                visited: false,
                description:
                    'A stone stairwell ends abruptly in a pile of rubble, the floors above having given way. ' +
                    'Cold air drifts up from somewhere below the debris.',
                exits: [
                    { direction: 'west', destinationRoomId: 'rampart' },
                    { direction: 'south', destinationRoomId: 'chapel' },
                ],
                inventory: {},
            },
            armory: {
                name: 'Armory',
                lightLevel: 'dim',
                visited: false,
                description:
                    'Broken weapon racks and split barrels of rusted nails fill this cramped room. A few coins ' +
                    'lie scattered in the dust, missed by whoever looted the rest.',
                exits: [
                    { direction: 'north', destinationRoomId: 'tower' },
                    { direction: 'east', destinationRoomId: 'courtyard' },
                    { direction: 'south', destinationRoomId: 'gatehouse' },
                ],
                inventory: { coins: 5 },
            },
            courtyard: {
                name: 'Courtyard',
                lightLevel: 'bright',
                visited: false,
                description:
                    'Weeds push up through cracked flagstones in this open courtyard. A dry fountain stands at ' +
                    'its center, its basin stained black with age.',
                exits: [
                    { direction: 'north', destinationRoomId: 'rampart' },
                    { direction: 'west', destinationRoomId: 'armory' },
                    { direction: 'east', destinationRoomId: 'chapel' },
                    { direction: 'south', destinationRoomId: 'entrance' },
                ],
                inventory: {},
            },
            chapel: {
                name: 'Ruined Chapel',
                lightLevel: 'dim',
                visited: false,
                description:
                    'Rows of splintered pews face a shattered altar. Whatever god this chapel once served, its ' +
                    'name has been chiseled from every wall. A rusted iron door to the south is bolted shut, its ' +
                    'keyhole clogged with grime.',
                exits: [
                    { direction: 'north', destinationRoomId: 'stairwell' },
                    { direction: 'west', destinationRoomId: 'courtyard' },
                    {
                        direction: 'south',
                        destinationRoomId: 'wellyard',
                        lock: { keyItemId: 'iron_key', isLocked: true, consumesKey: false },
                    },
                ],
                inventory: {},
            },
            gatehouse: {
                name: 'Gatehouse',
                lightLevel: 'dim',
                visited: false,
                description:
                    'The iron portcullis here has rusted fast in the open position. Chains hang slack from the ' +
                    'ceiling winch, long since rotted through.',
                exits: [
                    { direction: 'north', destinationRoomId: 'armory' },
                    { direction: 'east', destinationRoomId: 'entrance' },
                ],
                inventory: {},
            },
            entrance: {
                name: 'Entrance Hall',
                lightLevel: 'dim',
                visited: false,
                description:
                    'A dusty entrance hall, its doors long since rotted from their hinges. Faint light filters ' +
                    'in from the courtyard to the north.',
                exits: [
                    { direction: 'north', destinationRoomId: 'courtyard' },
                    { direction: 'west', destinationRoomId: 'gatehouse' },
                ],
                inventory: {},
            },
            wellyard: {
                name: 'Well Yard',
                lightLevel: 'bright',
                visited: false,
                description:
                    'A stone wellhead sits at the center of this small yard, its rope long rotted away. The ' +
                    'water below, if any remains, cannot be seen. The rusted iron door to the north stands open ' +
                    'behind you.',
                exits: [{ direction: 'north', destinationRoomId: 'chapel' }],
                inventory: {},
            },
        },
    };
}
