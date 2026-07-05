import { Exit } from './Exit';
import { DefaultLock, Lock } from '../lock';
import { DerivedValueStore, LockStore, RoomStore } from '../../store';
import { Direction, ExitBlockReason, ExitState, LockState, RoomId } from '../../state';

export class DefaultExit implements Exit {
    constructor(
        private readonly direction: Direction,
        private readonly roomStore: RoomStore,
    ) {}

    get destinationRoomId(): RoomId {
        return this.exitState().destinationRoomId;
    }

    isBlocked(): boolean {
        return this.lock()?.isLocked() ?? false;
    }

    blockReason(): ExitBlockReason | undefined {
        return this.isBlocked() ? 'door_locked' : undefined;
    }

    lock(): Lock | undefined {
        return this.exitState().lock ? new DefaultLock(this.lockStore()) : undefined;
    }

    private exitState(): Readonly<ExitState> {
        const exit = this.roomStore.get().exits.find((candidate) => candidate.direction === this.direction);
        if (!exit) {
            throw new Error(`Exit "${this.direction}" no longer exists in its room`);
        }
        return exit;
    }

    private lockStore(): LockStore {
        return new DerivedValueStore<LockState>(
            () => this.exitState().lock!,
            (lock) =>
                this.roomStore.update((room) => {
                    const exit = room.exits.find((candidate) => candidate.direction === this.direction);
                    if (exit) {
                        exit.lock = lock;
                    }
                }),
        );
    }
}
