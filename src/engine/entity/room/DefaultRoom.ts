import { Room } from './Room';
import { Direction, ExitState, RoomId } from '../../state';
import { RoomStore } from '../../store';

export class DefaultRoom implements Room {
    constructor(
        public readonly id: RoomId,
        private readonly store: RoomStore,
    ) {}

    getExit(direction: Direction): Readonly<ExitState> | undefined {
        const { exits } = this.store.get();
        return exits.find((exit) => exit.direction === direction);
    }
}
