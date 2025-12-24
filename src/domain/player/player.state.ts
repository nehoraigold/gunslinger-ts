import { Coordinate } from "../../utils";

export interface PlayerState {
  id: string;
  name: string;
  description: string;
  location: Coordinate;
  inventoryId: string;
}
