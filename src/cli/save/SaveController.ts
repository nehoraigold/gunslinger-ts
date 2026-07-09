import { RestorableSession } from '../../engine/session';
import { SessionRepository, InvalidSlotNameError } from '../../persistence';
import { LoadResult } from './LoadResult';
import { SaveListing } from './SaveListing';

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

    currentSlotName(): string {
        return this.currentSlot;
    }

    setCurrentSlotName(slot: string): void {
        this.validateSlotName(slot);
        this.currentSlot = slot;
    }

    async save(): Promise<void> {
        await this.repository.save(this.currentSlot, this.session.getState());
    }

    async load(name: string): Promise<LoadResult> {
        const state = await this.repository.load(name);
        if (!state) {
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

    private validateSlotName(slot: string): void {
        if (!VALID_SLOT_NAME.test(slot)) {
            throw new InvalidSlotNameError(slot, "only letters, digits, '-' and '_' are allowed");
        }
    }
}
