import { Room } from './Room';
import { Direction, ExitState, RoomId } from '../../state';
import { RoomStore } from '../../store';
import { DefaultExit, Exit } from '../exit';

export class DefaultRoom implements Room {
    constructor(
        public readonly id: RoomId,
        private readonly store: RoomStore,
    ) {}

    getExit(direction: Direction): Exit | undefined {
        const { exits } = this.store.get();
        const exitState = exits.find((exit) => exit.direction === direction);
        return exitState ? new DefaultExit(exitState, this.store) : undefined;
    }
}
