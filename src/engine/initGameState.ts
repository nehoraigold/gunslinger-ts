import path from 'path';
import { readFileSync } from 'fs';
import Papa from 'papaparse';

import { GameState } from './game.state';
import { ItemState, itemTableEntryToState } from '../domain/item';
import { addEmptyRoomInventories, InventoryState, inventoryTableEntryToState } from '../domain/inventory';
import { NPCState, npcTableEntryToState } from '../domain/npc';
import { RoomState, RoomTableEntry, roomTableEntryToState } from '../domain/room';
import { PlayerState } from '../domain/player';
import { playerTableEntryToState } from '../domain/player/player.table';
import { WorldState } from '../domain/world';
import { ExitState, exitTableEntryToState } from '../domain/exit';

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

const initializeItems = (): ItemState[] => {
    return initializeFromCsvFile('items.csv', itemTableEntryToState);
};

const initializeInventories = (rooms: RoomState[]): InventoryState[] => {
    const inventories = initializeFromCsvFile('inventories.csv', inventoryTableEntryToState);
    return addEmptyRoomInventories(inventories, rooms);
};

const initializeExits = (): ExitState[] => {
    return initializeFromCsvFile('exits.csv', exitTableEntryToState);
};

const initializeNpcs = (): NPCState[] => {
    return initializeFromCsvFile('npcs.csv', npcTableEntryToState);
};

const initializeRooms = (exits: ExitState[]): RoomState[] => {
    const convert = (data: RoomTableEntry): RoomState => roomTableEntryToState(data, exits);
    return initializeFromCsvFile('rooms.csv', convert);
};

const initializePlayer = (): PlayerState => {
    return initializeFromCsvFile('player.csv', playerTableEntryToState)[0];
};

export const initGameState = (): GameState => {
    const items = initializeItems();
    const exits = initializeExits();
    const rooms = initializeRooms(exits);
    const inventories = initializeInventories(rooms);
    const npcs = initializeNpcs();
    const player = initializePlayer();

    const world: WorldState = {
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
