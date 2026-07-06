import { TickSource } from './TickSource';

export interface TurnCounter extends TickSource {
    advance(): void;
}
