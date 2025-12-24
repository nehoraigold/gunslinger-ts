import { Coordinate } from "../../utils";
import { Direction } from '../../action'
import { ExitState } from "./exit.state";

export interface RoomState {
  id: string;
  name: string;
  description: string;
  visited: boolean;

  coordinates: Coordinate;

  exits: Partial<Record<Direction, ExitState>>;

  inventoryIds: string[];
  npcIds: string[];
}
