import { RestorableSession } from '../../engine/session';
import { RoomId } from '../../engine/state';
import { SessionRepository } from '../../persistence';

export type SaveResult = { status: 'saved'; name: string } | { status: 'invalid_name' };

export type LoadResult =
    | { status: 'loaded'; roomId: RoomId }
    | { status: 'not_found' }
    | { status: 'invalid_name' }
    | { status: 'corrupt'; reason: string };

export type SaveListing = { names: string[]; current: string };

const DEFAULT_SLOT = 'autosave';
const VALID_SLOT_NAME = /^[A-Za-z0-9_-]+$/;

export class SaveController {
    private currentSlot: string;

    constructor(
        private readonly repository: SessionRepository,
        private readonly session: RestorableSession,
        defaultSlot: string = DEFAULT_SLOT,
    ) {
        this.currentSlot = defaultSlot;
    }

    async autosave(): Promise<void> {
        await this.repository.save(this.currentSlot, this.session.getState());
    }

    async save(name?: string): Promise<SaveResult> {
        const slot = name ?? this.currentSlot;
        if (!VALID_SLOT_NAME.test(slot)) {
            return { status: 'invalid_name' };
        }
        this.currentSlot = slot;
        await this.repository.save(slot, this.session.getState());
        return { status: 'saved', name: slot };
    }

    async load(name: string): Promise<LoadResult> {
        if (!VALID_SLOT_NAME.test(name)) {
            return { status: 'invalid_name' };
        }
        let state;
        try {
            state = await this.repository.load(name);
        } catch (error) {
            return { status: 'corrupt', reason: (error as Error).message };
        }
        if (state === undefined) {
            return { status: 'not_found' };
        }
        this.session.restoreState(state);
        this.currentSlot = name;
        return { status: 'loaded', roomId: state.player.currentRoomId };
    }

    async list(): Promise<SaveListing> {
        const names = await this.repository.list();
        return { names, current: this.currentSlot };
    }
}
