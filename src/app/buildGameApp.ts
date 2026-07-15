import { Ollama } from 'ollama';

import { GameSession } from '../engine/session';
import { MoveAction } from '../engine/action/move/MoveAction';
import { PickUpAction } from '../engine/action/pickUp/PickUpAction';
import { DropAction } from '../engine/action/drop/DropAction';
import { EquipAction } from '../engine/action/equip/EquipAction';
import { UnequipAction } from '../engine/action/unequip/UnequipAction';
import { CheckInventoryAction } from '../engine/action/checkInventory/CheckInventoryAction';
import { CheckStatusAction } from '../engine/action/checkStatus/CheckStatusAction';
import { UnlockAction } from '../engine/action/unlock/UnlockAction';
import { LookAction } from '../engine/action/look/LookAction';
import { LookItemAction } from '../engine/action/lookItem/LookItemAction';
import { LookNpcAction } from '../engine/action/lookNpc/LookNpcAction';
import { TalkToAction } from '../engine/action/talkTo/TalkToAction';
import { BuyAction } from '../engine/action/buy/BuyAction';
import { SellAction } from '../engine/action/sell/SellAction';
import { GiveAction } from '../engine/action/give/GiveAction';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../engine/entity';
import { DefaultDialogueService, CleanupConversationTurnEffect } from '../engine/service/dialogue';
import { FileSessionRepository } from '../persistence';
import {
    GameMaster,
    StreamingGameMaster,
    ActionToolCatalog,
    DefaultActionDispatcher,
    DefaultWorldSnapshotBuilder,
    StaticInstructionsProvider,
    UnboundedConversationManager,
    DefaultLLMRequestAssembler,
    OllamaLLMClient,
    DefaultTurnLifecycle,
    SequentialLLMLoop,
    LLMTurnStrategy,
    ChoiceTurnStrategy,
    CompositeChoiceProvider,
    ShopChoiceProvider,
    LLMOutcomeNarrator,
} from '../gamemaster';
import { AppConfig } from './AppConfig';
import { GameApp } from './GameApp';
import { SaveController } from './save';
import { createSampleWorldState } from './sampleWorld';
import { SYSTEM_PROMPT } from './systemPrompt';

export function buildGameApp(config: AppConfig): GameApp {
    const dialogueService = new DefaultDialogueService();

    const session = new GameSession(
        createSampleWorldState(),
        {
            room: new DefaultRoomFactory(),
            item: new DefaultItemFactory(),
            npc: new DefaultNpcFactory(),
        },
        [new CleanupConversationTurnEffect(dialogueService)],
    );

    const saveController = new SaveController(new FileSessionRepository(config.saveDir), session);

    const toolCatalog = new ActionToolCatalog({
        move: {
            action: new MoveAction(),
            description:
                'Call when the player expresses intent to travel in any direction (north, south, east, west, up, down).',
        },
        pickUp: {
            action: new PickUpAction(),
            description: 'Call when the player expresses intent to take or pick up an item present in the room.',
        },
        drop: {
            action: new DropAction(),
            description: 'Call when the player expresses intent to drop or leave behind a carried item.',
        },
        equip: {
            action: new EquipAction(),
            description:
                'Call when the player expresses intent to wield, wear, or put on a carried weapon or piece of armor ' +
                '(e.g. "equip the revolver", "put on the duster"). Pass the exact item id from the snapshot. If the ' +
                'matching slot is already filled, the previously-equipped item returns to the inventory automatically.',
        },
        unequip: {
            action: new UnequipAction(),
            description:
                'Call when the player expresses intent to take off, remove, or stow what they have equipped (e.g. ' +
                '"holster the revolver", "take off my armor"). Pass the slot to clear ("weapon" or "armor"); the item ' +
                'returns to the inventory.',
        },
        checkInventory: {
            action: new CheckInventoryAction(),
            description:
                'Call when the player asks what they are carrying (e.g. "check my inventory", "what do I have").',
        },
        checkStatus: {
            action: new CheckStatusAction(),
            description:
                'Call when the player asks about their health, condition, or how badly hurt they are (e.g. "how am ' +
                'I doing", "check my health", "am I hurt"). Returns a coarse health description, never exact numbers.',
        },
        look: {
            action: new LookAction(),
            description:
                'Call when the player looks at, examines, or surveys their surroundings (e.g. "look around", "look", ' +
                '"examine the room"). Returns the room description, its light level, the exits, and the items present.',
        },
        lookItem: {
            action: new LookItemAction(),
            description:
                'Call when the player examines or inspects a specific item they can see in the room or are carrying ' +
                '(e.g. "examine the key", "look at the sword"). Pass the exact item id from the snapshot. Returns the ' +
                "item's description, kind, where it is, and how many are present.",
        },
        unlock: {
            action: new UnlockAction(),
            description:
                'Call when the player tries to unlock or open a locked exit (e.g. "unlock the door", "use the key on ' +
                'the south door"). Pass the direction of the locked exit.',
        },
        lookNpc: {
            action: new LookNpcAction(),
            description:
                'Call when the player examines or looks at a person present in the room (e.g. "look at the hermit", ' +
                '"examine the guard"). Pass the exact npc id from the snapshot. Returns the npc\'s name and appearance.',
        },
        talkTo: {
            action: new TalkToAction(dialogueService),
            description:
                'Call when the player speaks to, greets, or asks something of a person present in the room (e.g. ' +
                '"talk to the hermit", "ask the guard about the key"). Pass the exact npc id from the snapshot. ' +
                "Returns the npc's single line of dialogue.",
        },
        buy: {
            action: new BuyAction(),
            description:
                'Call when the player buys a for-sale item from a merchant present in the room (e.g. "buy the ' +
                'rifle", "purchase two potions"). Pass the merchant npc id and the item id from the snapshot, plus ' +
                'an optional quantity (default 1). Only wares the snapshot lists as for sale can be bought.',
        },
        sell: {
            action: new SellAction(),
            description:
                'Call when the player sells an item from their inventory to a merchant present in the room (e.g. ' +
                '"sell my revolver", "sell three pelts"). Pass the merchant npc id and the item id, plus an optional ' +
                'quantity (default 1). The merchant only buys item types the snapshot says it buys.',
        },
        give: {
            action: new GiveAction(),
            description:
                'Call when the player gives, hands, offers, or turns in a carried item to a person present in the ' +
                'room (e.g. "give the key to the hermit", "hand over the letter"). Pass the npc id and the item id ' +
                'from the snapshot, plus an optional quantity (default 1).',
        },
    });

    const ollama = new Ollama(config.ollamaHost ? { host: config.ollamaHost } : undefined);
    const ollamaClient = new OllamaLLMClient(ollama, config.ollamaModel);

    const requestAssembler = new DefaultLLMRequestAssembler(
        new StaticInstructionsProvider(SYSTEM_PROMPT),
        toolCatalog.listDefinitions(),
    );

    const conversationManager = new UnboundedConversationManager();
    const turnLifecycle = new DefaultTurnLifecycle(new DefaultWorldSnapshotBuilder(), conversationManager);
    const actionDispatcher = new DefaultActionDispatcher(toolCatalog);

    const turnStrategy = new LLMTurnStrategy(
        new SequentialLLMLoop(ollamaClient, requestAssembler, actionDispatcher),
        turnLifecycle,
    );
    const choiceProvider = new CompositeChoiceProvider([new ShopChoiceProvider()]);
    const choiceTurnStrategy = new ChoiceTurnStrategy(
        actionDispatcher,
        choiceProvider,
        new LLMOutcomeNarrator(turnLifecycle, requestAssembler, ollamaClient),
    );

    const gameMaster: GameMaster = new StreamingGameMaster(session, turnStrategy, choiceTurnStrategy, choiceProvider);

    return { session, saveController, gameMaster, conversationManager };
}
