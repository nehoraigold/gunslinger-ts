import { Direction, LightLevel, NpcId, RoomId } from '../../state';
import { Condition } from '../../condition/Condition';
import { Exit } from '../exit';
import { Inventory } from '../inventory';

export interface Room {
    id: RoomId;
    readonly name: string;
    readonly description: string;
    readonly lightLevel: LightLevel;
    readonly visited: boolean;
    getExit(direction: Direction): Exit | undefined;
    exits(): Exit[];
    markVisited(): void;
    inventory(): Inventory;
    npcIds(): NpcId[];
    entryCondition(): Condition | undefined;
}
