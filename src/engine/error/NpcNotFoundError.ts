import { NpcId } from '../state';

export class NpcNotFoundError extends Error {
    constructor(npcId: NpcId) {
        super(`No npc with ID "${npcId}"`);
        this.name = 'NpcNotFoundError';
    }
}
