import { ItemId } from '../../state';
import { Item, Player } from '../../entity';
import { Context } from '../../context';
import { applyItemEffect } from '../../effect';
import { UseItemService } from './UseItemService';
import { UseItemOutcome } from './UseItemOutcome';

export class DefaultUseItemService implements UseItemService {
    constructor(private readonly ctx: Context) {}

    use(itemId: ItemId, item: Item, player: Player): UseItemOutcome {
        if (!player.inventory().has(itemId)) {
            return { type: 'notCarried' };
        }
        if (!item.useEffect) {
            return { type: 'notUsable' };
        }
        const effect = item.useEffect;
        applyItemEffect(this.ctx, effect);
        if (item.consumedOnUse) {
            player.inventory().remove(itemId);
        }
        return { type: 'used', effect };
    }
}
