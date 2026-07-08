import { Room } from '../../entity';
import { Condition } from '../../condition';

export type MovementOutcome =
    | { type: 'moved'; room: Room }
    | { type: 'noSuchExit' }
    | { type: 'exitBlocked' }
    | { type: 'entryBarred'; unmet: Condition[] };
