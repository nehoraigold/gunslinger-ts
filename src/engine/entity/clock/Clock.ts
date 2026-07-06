import { TickSource } from './TickSource';

export interface Clock extends TickSource {
    advance(): void;
}
