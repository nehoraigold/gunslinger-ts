import { ItemId } from '../../state';
import { Item, Player } from '../../entity';
import { UseItemOutcome } from './UseItemOutcome';

export interface UseItemService {
    use(itemId: ItemId, item: Item, player: Player): UseItemOutcome;
}
