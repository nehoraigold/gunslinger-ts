import { Direction } from '../../state';
import { MovementOutcome } from './MovementOutcome';

export interface MovementService {
    move(direction: Direction): MovementOutcome;
}
