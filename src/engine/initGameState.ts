import path from 'path';
import { readFileSync } from 'fs';
import Papa from 'papaparse';

import { GameState } from './game.state';
import { Item, itemTableEntryToState } from '../domain/item';
import { addEmptyRoomInventories, Inventory, inventoryTableEntryToState } from '../domain/inventory';
import { Npc, npcTableEntryToState } from '../domain/npc';
import { Room, RoomTableEntry, roomTableEntryToState } from '../domain/room';
import { Player } from '../domain/player';
import { playerTableEntryToState } from '../domain/player/player.table';
import { World } from '../domain/world';
import { Exit, exitTableEntryToState } from '../domain/exit';

const CONTENT_FOLDER = 'content';

const initializeFromCsvFile = <TableEntryT, EntityStateT>(
    filename: string,
    convertFunc: (entry: TableEntryT) => EntityStateT,
): EntityStateT[] => {
    const csvPath = path.resolve('../', CONTENT_FOLDER, filename);
    const csv = readFileSync(csvPath, 'utf8');
    const { data } = Papa.parse(csv, { delimiter: ',', header: true, dynamicTyping: true });
    return (data as TableEntryT[]).map(convertFunc);
};

const fromArrayToMap = <T extends { id: string }>(entries: T[]): Record<string, T> => {
    return Object.fromEntries(entries.map((entry) => [entry.id, entry]));
};

const initializeItems = (): Item[] => {
    return initializeFromCsvFile('items.csv', itemTableEntryToState);
};

const initializeInventories = (rooms: Room[]): Inventory[] => {
    const inventories = initializeFromCsvFile('inventories.csv', inventoryTableEntryToState);
    return addEmptyRoomInventories(inventories, rooms);
};

const initializeExits = (): Exit[] => {
    return initializeFromCsvFile('exits.csv', exitTableEntryToState);
};

const initializeNpcs = (): Npc[] => {
    return initializeFromCsvFile('npcs.csv', npcTableEntryToState);
};

const initializeRooms = (exits: Exit[]): Room[] => {
    const convert = (data: RoomTableEntry): Room => roomTableEntryToState(data, exits);
    return initializeFromCsvFile('rooms.csv', convert);
};

const initializePlayer = (): Player => {
    return initializeFromCsvFile('player.csv', playerTableEntryToState)[0];
};

export const initGameState = (): GameState => {
    const items = initializeItems();
    const exits = initializeExits();
    const rooms = initializeRooms(exits);
    const inventories = initializeInventories(rooms);
    const npcs = initializeNpcs();
    const player = initializePlayer();

    const world: World = {
        flags: {},
        exits: fromArrayToMap(exits),
        rooms: fromArrayToMap(rooms),
        inventories: fromArrayToMap(inventories),
        items: fromArrayToMap(items),
        npcs: fromArrayToMap(npcs),
    };
    return {
        world,
        player,
    };
};
