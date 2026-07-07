import { Room } from '../../entity';

export type MovementOutcome =
    | { type: 'moved'; room: Room }
    | { type: 'noSuchExit' }
    | { type: 'exitBlocked' }
    | { type: 'entryBarred' };
