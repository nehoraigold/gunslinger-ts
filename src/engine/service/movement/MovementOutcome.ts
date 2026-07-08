import { Room } from '../../entity';
import { Condition } from '../../condition';
import { ExitBlockReason } from '../../state';

export type MovementOutcome =
    | { type: 'moved'; room: Room }
    | { type: 'noSuchExit' }
    | { type: 'exitBlocked'; blockReason: ExitBlockReason }
    | { type: 'entryBarred'; unmet: Condition[] };
