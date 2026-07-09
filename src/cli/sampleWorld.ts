import { GameState } from '../engine/state';

export function createSampleWorldState(): GameState {
    return {
        turnCounter: { count: 0 },
        flags: {},
        player: {
            id: 'player',
            name: 'Adventurer',
            currentRoomId: 'entrance',
            equipment: { weapon: undefined, armor: undefined },
            inventory: { cursed_amulet: 1 },
            money: 20,
        },
        items: {
            coins: {
                name: 'Coins',
                description: 'A handful of tarnished silver coins.',
                type: 'misc',
                stackable: true,
                value: 1,
                weight: 0,
                takeable: true,
                droppable: true,
            },
            iron_key: {
                name: 'Iron Key',
                description: 'A small iron key, its teeth worn smooth with age.',
                type: 'key',
                stackable: false,
                value: 5,
                weight: 1,
                takeable: true,
                droppable: true,
            },
            dry_fountain: {
                name: 'Dry Fountain',
                description: 'A cracked stone fountain, its basin long since gone dry. Far too heavy to move.',
                type: 'misc',
                stackable: false,
                value: 0,
                weight: 2000,
                takeable: false,
                droppable: true,
            },
            cursed_amulet: {
                name: 'Cursed Amulet',
                description:
                    'A tarnished amulet that hangs heavy and cold against the chest. Hallowed ground will not ' +
                    'suffer its presence.',
                type: 'misc',
                stackable: false,
                value: 0,
                weight: 1,
                takeable: true,
                droppable: true,
            },
            rusty_revolver: {
                name: 'Rusty Revolver',
                description: 'A six-shooter gone orange with rust, though its cylinder still turns true.',
                type: 'weapon',
                stackable: false,
                value: 15,
                weight: 3,
                takeable: true,
                droppable: true,
            },
            leather_duster: {
                name: 'Leather Duster',
                description: 'A long, weather-cracked coat of oiled leather, heavy enough to turn a glancing blow.',
                type: 'armor',
                stackable: false,
                value: 12,
                weight: 4,
                takeable: true,
                droppable: true,
            },
        },
        npcs: {
            hermit: {
                name: 'Ragged Hermit',
                appearance:
                    'A gaunt figure wrapped in mildewed rags sits against the dry fountain, watching you with ' +
                    'pale, unblinking eyes.',
                dialogue: 'The key you seek opens more than one door, traveller. Mind which you choose to open.',
                money: 5,
                mood: 'guarded',
                health: 10,
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
                npcIds: [],
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
                npcIds: [],
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
                npcIds: [],
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
                npcIds: [],
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
                inventory: { dry_fountain: 1 },
                npcIds: ['hermit'],
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
                // Hallowed ground: enterable only once the player has parted with the cursed amulet
                // and has spoken with the hermit.
                entryCondition: {
                    type: 'and',
                    conditions: [
                        { type: 'lacks_item', itemId: 'cursed_amulet', location: 'player' },
                        { type: 'flag_value', key: 'talked_to_hermit', value: true },
                    ],
                },
                inventory: {},
                npcIds: [],
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
                npcIds: [],
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
                inventory: { rusty_revolver: 1, leather_duster: 1 },
                npcIds: [],
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
                npcIds: [],
            },
        },
    };
}
