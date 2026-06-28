// @ts-ignore
import blessed from 'blessed';
import { BlessedScreen } from '../screen';
import { GameState } from '../../engine/state/GameState';
import { isAlive, isHostile } from '../../engine/npc/npcUtils';
import { TradeAction } from '../../engine/actions/trade';
import { TradeResult, TradeTransaction } from '../../agent/adventureAgent';

type TradeMode = 'sell' | 'buy';

type SellEntry = { label: string; itemId: string; sellable: boolean };
type BuyEntry = { label: string; itemId: string; forSale: boolean; price: number };

export class TradeModal {
    constructor(private readonly screen: BlessedScreen) {}

    /** Show interactive single-panel trade UI. Returns when the player closes the modal. */
    show(state: GameState, npcId: string): Promise<TradeResult> {
        return new Promise((resolve) => {
            const npc = state.world.npcs[npcId];

            if (!npc || !isAlive(npc) || isHostile(npc)) {
                resolve({
                    finalState: state,
                    summary: {
                        transactions: [],
                        playerGoldBefore: state.player.gold,
                        playerGoldAfter: state.player.gold,
                    },
                });
                return;
            }

            let liveState = state;
            const playerGoldAtOpen = state.player.gold;
            const transactions: TradeTransaction[] = [];
            let mode: TradeMode = 'buy';

            // inputState is NOT set to 'idle' inside promise resolver callbacks —
            // executeTrade sets it after each await returns, ensuring the list-level
            // escape handler still sees 'prompting' during the same synchronous frame.
            let inputState: 'idle' | 'prompting' = 'idle';

            // ── Layout ────────────────────────────────────────────────────────────
            const modal = blessed.box({
                parent: this.screen,
                top: 'center',
                left: 'center',
                width: '70%',
                height: '70%',
                label: ` Trade with ${npc.name} `,
                border: { type: 'line' },
                style: { border: { fg: 'yellow' }, label: { bold: true, fg: 'yellow' } },
                tags: true,
            });

            const goldHeader = blessed.text({
                parent: modal,
                top: 0,
                left: 1,
                width: '100%-4',
                height: 1,
                content: '',
                style: { fg: 'yellow' },
                tags: true,
            });

            const modeHeader = blessed.text({
                parent: modal,
                top: 2,
                left: 1,
                width: '100%-4',
                height: 1,
                content: '',
                tags: true,
            });

            const list = blessed.list({
                parent: modal,
                top: 4,
                left: 0,
                width: '100%',
                height: '100%-8',
                border: { type: 'line' },
                style: {
                    border: { fg: 'yellow' },
                    selected: { bg: 'blue', bold: true },
                    item: { fg: 'white' },
                },
                keys: true,
                vi: true,
                mouse: true,
                tags: true,
                items: [],
            });

            const statusLine = blessed.text({
                parent: modal,
                bottom: 2,
                left: 1,
                width: '100%-4',
                height: 1,
                content: '',
                style: { fg: 'cyan' },
                tags: true,
            });

            blessed.text({
                parent: modal,
                bottom: 0,
                left: 1,
                width: '100%-4',
                height: 1,
                content: '[ENTER] Trade  [TAB] Switch Mode  [ESC/Q] Close',
                style: { fg: 'grey' },
            });

            // ── Data builders ─────────────────────────────────────────────────────
            let sellData: SellEntry[] = [];
            let buyData: BuyEntry[] = [];

            const buildSellData = (): SellEntry[] => {
                const currentNpc = liveState.world.npcs[npcId];
                const npcGold = currentNpc?.gold ?? 0;
                return Object.entries(liveState.player.inventory)
                    .filter(([, qty]) => qty > 0)
                    .map(([id, qty]) => {
                        const item = liveState.world.items[id];
                        if (!item) return null;
                        const price = item.value;
                        if (!item.droppable) {
                            return {
                                label: `{grey-fg}${item.name} ×${qty}  [not sellable]{/grey-fg}`,
                                itemId: id,
                                sellable: false,
                            };
                        }
                        if (npcGold < price) {
                            return {
                                label: `{grey-fg}${item.name} ×${qty}  [${price}gp — NPC can't afford]{/grey-fg}`,
                                itemId: id,
                                sellable: false,
                            };
                        }
                        return { label: `${item.name} ×${qty}  [${price}gp]`, itemId: id, sellable: true };
                    })
                    .filter((x): x is SellEntry => x !== null);
            };

            const buildBuyData = (): BuyEntry[] => {
                const currentNpc = liveState.world.npcs[npcId];
                if (!currentNpc) return [];
                // Show ALL NPC inventory: for-sale items are buyable; items the player
                // sold back appear with forSale:false and are displayed as "[sold]".
                return currentNpc.inventory
                    .filter((e) => e.quantity > 0)
                    .map((e) => {
                        const item = liveState.world.items[e.itemId];
                        if (!item) return null;
                        if (!e.forSale || e.price == null) {
                            return {
                                label: `{grey-fg}${item.name} ×${e.quantity}  [sold]{/grey-fg}`,
                                itemId: e.itemId,
                                forSale: false,
                                price: 0,
                            };
                        }
                        const price = e.price;
                        const canAfford = liveState.player.gold >= price;
                        if (!canAfford) {
                            return {
                                label: `{grey-fg}${item.name} ×${e.quantity}  [${price}gp — can't afford]{/grey-fg}`,
                                itemId: e.itemId,
                                forSale: true,
                                price,
                            };
                        }
                        return {
                            label: `${item.name} ×${e.quantity}  [${price}gp]`,
                            itemId: e.itemId,
                            forSale: true,
                            price,
                        };
                    })
                    .filter((x): x is BuyEntry => x !== null);
            };

            // ── Refresh ───────────────────────────────────────────────────────────
            const updateGoldHeader = () => {
                const currentNpc = liveState.world.npcs[npcId];
                goldHeader.setContent(
                    `Your Gold: {bold}${liveState.player.gold} gp{/bold}  |  ${npc.name}'s Gold: {bold}${currentNpc?.gold ?? 0} gp{/bold}`,
                );
            };

            const updateModeHeader = () => {
                if (mode === 'sell') {
                    modeHeader.setContent(
                        `{yellow-fg}{bold}[ SELL your items ]{/bold}{/yellow-fg}   ·   BUY from ${npc.name}   {grey-fg}[TAB to switch]{/grey-fg}`,
                    );
                } else {
                    modeHeader.setContent(
                        `SELL your items   ·   {yellow-fg}{bold}[ BUY from ${npc.name} ]{/bold}{/yellow-fg}   {grey-fg}[TAB to switch]{/grey-fg}`,
                    );
                }
            };

            const setStatus = (msg: string) => {
                statusLine.setContent(msg);
                this.screen.render();
            };

            const refreshList = (preserveIndex = false) => {
                const prevIndex: number = preserveIndex ? ((list as any).selected ?? 0) : 0;
                if (mode === 'sell') {
                    sellData = buildSellData();
                    list.setItems(sellData.length > 0 ? sellData.map((x) => x.label) : ['(nothing to sell)']);
                } else {
                    buyData = buildBuyData();
                    list.setItems(buyData.length > 0 ? buyData.map((x) => x.label) : ['(nothing for sale)']);
                }
                const maxIndex = Math.max(0, (mode === 'sell' ? sellData : buyData).length - 1);
                list.select(Math.min(prevIndex, maxIndex));
                updateModeHeader();
                updateGoldHeader();
                this.screen.render();
            };

            const setMode = (m: TradeMode) => {
                mode = m;
                refreshList(false);
                list.focus();
            };

            // ── Close ─────────────────────────────────────────────────────────────
            const close = () => {
                if (inputState !== 'idle') return;
                modal.destroy();
                this.screen.render();
                resolve({
                    finalState: liveState,
                    summary: {
                        transactions,
                        playerGoldBefore: playerGoldAtOpen,
                        playerGoldAfter: liveState.player.gold,
                    },
                });
            };

            // ── Quantity prompt — direct keypress accumulation ────────────────────
            const promptQuantity = (maxQty: number): Promise<number | null> => {
                return new Promise((resolveQty) => {
                    if (maxQty <= 1) {
                        resolveQty(1);
                        return;
                    }

                    inputState = 'prompting';
                    let digits = '';

                    const updatePrompt = () =>
                        setStatus(`How many? (1–${maxQty})  [${digits || '_'}]  Enter=confirm  Esc=cancel`);
                    updatePrompt();

                    const qtyKeys = [
                        '0',
                        '1',
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '9',
                        'backspace',
                        'enter',
                        'return',
                        'escape',
                    ];
                    const unregister = () => qtyKeys.forEach((k) => this.screen.unkey(k, qtyHandler));

                    const qtyHandler = (ch: string | null, key: { name: string }) => {
                        if (key.name === 'enter' || key.name === 'return') {
                            unregister();
                            const n = parseInt(digits, 10);
                            resolveQty(!isNaN(n) && n >= 1 && n <= maxQty ? n : null);
                        } else if (key.name === 'escape') {
                            unregister();
                            resolveQty(null);
                        } else if (key.name === 'backspace') {
                            digits = digits.slice(0, -1);
                            updatePrompt();
                        } else if (ch && /^\d$/.test(ch) && digits.length < 4) {
                            digits += ch;
                            updatePrompt();
                        }
                    };

                    this.screen.key(qtyKeys, qtyHandler);
                });
            };

            // ── Confirmation prompt ───────────────────────────────────────────────
            const confirmTrade = (msg: string): Promise<boolean> => {
                return new Promise((resolveConfirm) => {
                    inputState = 'prompting';
                    setStatus(`${msg}  (y/n)`);

                    const confirmKeys = ['y', 'n', 'escape'];
                    const unregister = () => confirmKeys.forEach((k) => this.screen.unkey(k, confirmHandler));

                    const confirmHandler = (_ch: string | null, key: { name: string }) => {
                        if (key.name === 'y') {
                            unregister();
                            resolveConfirm(true);
                        } else if (key.name === 'n' || key.name === 'escape') {
                            unregister();
                            resolveConfirm(false);
                        }
                    };

                    this.screen.key(confirmKeys, confirmHandler);
                });
            };

            // ── Trade execution ───────────────────────────────────────────────────
            const executeTrade = async (direction: 'buy' | 'sell', itemId: string, maxQty: number) => {
                const qty = await promptQuantity(maxQty);
                inputState = 'idle';
                if (qty === null) {
                    setStatus('');
                    list.focus();
                    return;
                }

                const item = liveState.world.items[itemId];
                const itemName = item?.name ?? itemId;

                let price: number;
                if (direction === 'sell') {
                    price = (item?.value ?? 0) * qty;
                } else {
                    const currentNpc = liveState.world.npcs[npcId];
                    const entry = currentNpc?.inventory.find((e) => e.itemId === itemId && e.forSale);
                    price = (entry?.price ?? 0) * qty;
                }

                const verb = direction === 'sell' ? 'Sell' : 'Buy';
                const confirmed = await confirmTrade(`${verb} ${qty}x ${itemName} for ${price}gp?`);
                inputState = 'idle';

                if (!confirmed) {
                    setStatus('');
                    list.focus();
                    return;
                }

                const { state: nextState, outcome } = TradeAction.execute(liveState, {
                    npcId,
                    direction,
                    itemId,
                    quantity: qty,
                });

                if (outcome.result === 'success' && nextState) {
                    liveState = nextState;
                    transactions.push({ direction, itemName, quantity: qty, totalPrice: price });
                    setStatus(`${direction === 'sell' ? 'Sold' : 'Bought'} ${qty}x ${itemName} for ${price}gp.`);
                    refreshList(false);
                } else if (outcome.result === 'failure') {
                    setStatus(`Failed: ${outcome.message ?? outcome.reason}`);
                    list.focus();
                }
            };

            // ── Key bindings ──────────────────────────────────────────────────────
            list.key(['tab'], () => {
                if (inputState !== 'idle') return;
                setMode(mode === 'sell' ? 'buy' : 'sell');
            });
            list.key(['escape', 'q'], () => {
                if (inputState !== 'idle') return;
                close();
            });

            list.on('select', async (_item: unknown, index: number) => {
                if (inputState !== 'idle') return;

                if (mode === 'sell') {
                    const entry = sellData[index];
                    if (!entry) return;
                    if (!entry.sellable) {
                        setStatus('That item cannot be sold.');
                        return;
                    }
                    const qty = liveState.player.inventory[entry.itemId] ?? 0;
                    await executeTrade('sell', entry.itemId, qty);
                } else {
                    const entry = buyData[index];
                    if (!entry) return;
                    if (!entry.forSale) {
                        setStatus('That item is not for sale.');
                        return;
                    }
                    if (liveState.player.gold < entry.price) {
                        setStatus(`You can't afford that (need ${entry.price}gp, have ${liveState.player.gold}gp).`);
                        return;
                    }
                    const currentNpc = liveState.world.npcs[npcId];
                    const npcEntry = currentNpc?.inventory.find((e) => e.itemId === entry.itemId && e.forSale);
                    const qty = npcEntry?.quantity ?? 1;
                    await executeTrade('buy', entry.itemId, qty);
                }
            });

            // ── Initial render ────────────────────────────────────────────────────
            refreshList(false);
            list.focus();
        });
    }
}
