import { Ollama } from 'ollama';

import { GameSession } from '../engine/session';
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
import { createActionMap } from './actionCatalog';
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

    const toolCatalog = new ActionToolCatalog(createActionMap(dialogueService));

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

    return {
        gameMaster,
        saveController,
        currentRoomId: () => session.getState().player.currentRoomId,
        resetConversation: () => conversationManager.clear(),
    };
}
