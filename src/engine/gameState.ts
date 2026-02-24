// // =============================================================================
// // TEXT ADVENTURE ENGINE — COMPLETE STATE TYPE DEFINITIONS
// // =============================================================================
// // This file is the single source of truth for all game state shapes.
// // Every tool reads from and writes to structures defined here.
// // No tool may access raw state outside of StateManager.
// //
// // Conventions:
// //   - All entity IDs are strings in the format "{type}_{name}_{index}"
// //     e.g. "room_crypt_02", "npc_mira_01", "item_brass_key_01"
// //   - All flag keys are snake_case following the convention in AGENT_INSTRUCTIONS.md
// //   - All prose fields (healthProse, demeanor, etc.) are pre-computed by
// //     StateManager and should never require the LLM to do arithmetic
// //   - Optional fields use undefined (not null) unless the field explicitly
// //     represents a nullable slot (e.g. equippedWeapon: Item | null)
// // =============================================================================
//
// // =============================================================================
// // PRIMITIVES & SHARED TYPES
// // =============================================================================
//
// // Pre-computed prose representations of numeric values.
// // StateManager produces these — tools and the LLM consume them.
//
// export type ErrorCode =
//     | 'INVALID_STATE' // Action impossible given current game state
//     | 'NOT_FOUND' // Referenced entity does not exist
//     | 'FORBIDDEN' // Action exists but is blocked by a game rule
//     | 'INTERNAL'; // Unexpected system failure — triggers full rollback
//
// // =============================================================================
// // TOOL RESULT ENVELOPE
// // =============================================================================
//
// // Every tool returns this. Check ok before reading data.
// // If ok is false, narrate the failure in-world using error.message.
// // Never expose ok, code, or any raw field name in narration.
// export interface ToolResult<T> {
//     ok: boolean;
//     data?: T;
//     error?: {
//         code: ErrorCode;
//         message: string; // Human-readable. Safe to use as narration basis.
//     };
// }
//
// // =============================================================================
// // ITEMS
// // =============================================================================
//
// // A secret that is only revealed when a condition is met.
// // StateManager evaluates conditions against current GameState.
//
// // Defines what useItem() does when dispatched for this item type.
// // Handler receives current state and optional targetId.
// // Returns a UseItemEffect describing what happened.
// export interface UseItemEffect {
//     effect: UseEffect;
//     value?: number;
//     targetStateChange?: string; // Human-readable. e.g. "The chest is now unlocked."
//     stateFlags: Record<FlagKey, FlagValue>;
//     consumeItem: boolean;
// }
//
// export type UseEffect =
//     | 'healed'
//     | 'unlocked'
//     | 'poisoned_target'
//     | 'damaged_target'
//     | 'buff_applied'
//     | 'lore_revealed'
//     | 'none';
//
// // Lightweight version returned in room and inventory listings.
// // Always includes id so the LLM can reference it in subsequent tool calls.
//
// // =============================================================================
// // NPCS
// // =============================================================================
//
// // =============================================================================
// // ROOMS
// // =============================================================================
//
// // =============================================================================
// // PLAYER
// // =============================================================================
//
// // =============================================================================
// // COMBAT
// // =============================================================================
//
// // Non-null when a combat encounter is active.
// // Cleared on enemy defeat or successful flee.
//
// // =============================================================================
// // QUESTS
// // =============================================================================
//
// // =============================================================================
// // FLAGS
// // =============================================================================
//
// // The complete flag store.
// // All flag access goes through StateManager.getFlag() and StateManager.setFlag().
//
// // =============================================================================
// // CONVERSATION HISTORY
// // =============================================================================
//
// // A single turn's exchange, stored in ConversationManager.
// export interface Turn {
//     turnNumber: number;
//     playerInput: string;
//     toolCalls: TurnToolCall[];
//     narration: string; // The LLM's final narration for this turn
//     timestamp: number; // Unix ms
// }
//
// export interface TurnToolCall {
//     toolName: string;
//     params: Record<string, unknown>;
//     result: ToolResult<unknown>;
//     executedAtMs: number;
// }
//
// // Compressed representation of turns that have left the recent window.
// // Produced by the compression LLM call.
// export interface NarrativeSummary {
//     coveredTurns: [number, number]; // [firstTurn, lastTurn] inclusive
//     content: string; // Prose summary in past tense from player perspective
//     keyFlags: FlagKey[]; // Flags set during this window, for quick reference
//     compressedAtTurn: number;
// }
//
// // =============================================================================
// // WORLD
// // =============================================================================
//
// // =============================================================================
// // GAME META
// // =============================================================================
//
// export interface SaveMetadata {
//     slot: number;
//     savedAtTurn: number;
//     savedAtTimestamp: number; // Unix ms
//     playerRoomName: string; // Human-readable location for save selection UI
//     playerHealthProse: HealthProse;
//     totalPlaytimeMs: number;
// }
//
// export interface GameMeta {
//     sessionId: string;
//     startedAtTimestamp: number;
//     totalPlaytimeMs: number;
//     turnCount: number;
//     lastSavedTurn?: number;
//
//     // Whether debug mode is active (--debug flag)
//     debugMode: boolean;
// }
//
// // =============================================================================
// // ROOT GAME STATE
// // =============================================================================
//
// // =============================================================================
// // TURN EXECUTION
// // =============================================================================
//
// // Returned by StateManager.executeTurn() to the game loop.
// // Tells the LLM how to narrate the turn's outcome.
// export type TurnFailType = 'hard' | 'soft' | null;
//
// export interface TurnResult {
//     // Results of tool calls that succeeded and were committed
//     committed: ToolResult<unknown>[];
//
//     // The tool call that failed, if any
//     failed: TurnToolCall | null;
//
//     // "hard" = INTERNAL error, full rollback, player retries
//     // "soft" = expected rejection, partial commit, narrate failure
//     // null = all tools succeeded
//     failType: TurnFailType;
//
//     // Instruction to the LLM for how to narrate this turn
//     llmInstruction: LlmTurnInstruction;
// }
//
// export type LlmTurnInstruction =
//     | 'full_success' // All tools committed. Narrate everything.
//     | 'partial_commit' // Some tools committed, then soft failure. Narrate successes + failure.
//     | 'full_rollback'; // Hard failure. Nothing committed. Ask player to retry.
//
// // =============================================================================
// // WORLD SNAPSHOT (injected into every LLM message)
// // =============================================================================
//
// // The structured data that buildWorldSnapshot() serialises to a string
// // and appends to every user message. All IDs are present.
//
// // =============================================================================
// // TOOL INPUT / OUTPUT TYPES
// // =============================================================================
// // These mirror the tool parameter and return shapes in AGENT_INSTRUCTIONS.md.
// // Every tool function is typed as:
// //   (params: XxxParams, state: GameState) => Promise<ToolResult<XxxResult>>
//
// // ── Navigation ──────────────────────────────────────────────────────────────
//
// export interface LookItemParams {
//     itemId: ItemId;
// }
// export interface LookItemResult {
//     id: ItemId;
//     name: string;
//     fullDescription: string;
//     type: ItemType;
//     stats?: ItemStats;
//     interactable: boolean;
//     usageHint?: string;
//     revealedSecrets: string[];
//     location: ItemLocation;
// }
//
// export interface LookNpcParams {
//     npcId: NpcId;
// }
// export interface LookNpcResult {
//     id: NpcId;
//     name: string;
//     appearance: string;
//     demeanor: string; // Derived from mood + personality by StateManager
//     visibleEquipment: string[];
//     healthProse: EnemyHealthProse;
//     notableFeatures: string[]; // Pre-filtered by StateManager against conditions
//     relationshipScore: number; // -100 to 100. LLM translates — never exposes number
// }
//
// export interface LookExitParams {
//     direction: Direction;
// }
// export interface LookExitResult {
//     direction: Direction;
//     destinationName?: string;
//     visible: boolean;
//     description: string;
//     isBlocked: boolean;
//     blockReason?: string;
// }
//
// // ── Inventory ────────────────────────────────────────────────────────────────
//
// export interface PickUpParams {
//     itemId: ItemId;
// }
// export interface PickUpResult {
//     item: Item;
//     inventoryCount: number;
//     inventoryWeight: number;
//     failReason?: 'not_in_room' | 'already_owned' | 'too_heavy' | 'cursed_to_ground';
// }
//
// export interface DropParams {
//     itemId: ItemId;
// }
// export interface DropResult {
//     item: Item;
//     droppedInRoomId: RoomId;
//     wasEquipped: boolean;
//     failReason?: 'not_in_inventory' | 'cursed_cannot_drop';
// }
//
// export interface EquipParams {
//     itemId: ItemId;
// }
// export interface EquipResult {
//     item: Item;
//     slot: EquipSlot;
//     previouslyEquipped?: Item;
//     newStats: PlayerStats;
//     failReason?: 'not_in_inventory' | 'wrong_type' | 'stat_requirement_not_met';
// }
//
// export interface UseItemParams {
//     itemId: ItemId;
//     targetId?: EntityId;
// }
// export interface UseItemResult {
//     effect: UseEffect;
//     value?: number;
//     itemConsumed: boolean;
//     targetStateChange?: string;
//     stateFlags: Record<FlagKey, FlagValue>;
//     failReason?: 'not_in_inventory' | 'no_valid_target' | 'target_not_in_range' | 'item_not_usable_here' | 'wrong_key';
// }
//
// export interface CheckInventoryResult {
//     items: Item[];
//     equippedWeapon: Item | null;
//     equippedArmor: Item | null;
//     gold: number;
//     totalWeight: number;
//     maxWeight: number;
// }
//
// // ── Combat ───────────────────────────────────────────────────────────────────
//
// export interface AttackParams {
//     targetId: NpcId;
//     ability?: string;
// }
// export interface AttackResult {
//     playerDamageDealt: number;
//     playerAttackType: AttackType;
//     enemyDamageDealt: number;
//     enemyAttackType: AttackType;
//     playerHealthRemaining: number;
//     playerHealthProse: HealthProse;
//     enemyHealthRemaining: number;
//     enemyHealthProse: EnemyHealthProse;
//     enemyDefeated: boolean;
//     playerDefeated: boolean;
//     lootDropped?: Item[];
//     xpGained?: number;
//     failReason?: 'not_in_combat' | 'invalid_target' | 'unknown_ability';
// }
//
// export interface FleeResult {
//     success: boolean;
//     escapedToRoomId?: RoomId;
//     escapedToRoomName?: string;
//     damageTaken: number;
//     playerHealthProse: HealthProse;
//     failReason?: 'cornered' | 'too_slow' | 'enemy_holds_exit';
// }
//
// // ── Interaction ──────────────────────────────────────────────────────────────
//
// export interface TalkToParams {
//     npcId: NpcId;
//     message?: string;
//     dialogueNode?: string;
// }
//
// export interface TalkToResult {
//     npcId: NpcId;
//     npcName: string;
//     personality: string;
//     mood: NpcMood;
//     knowledgeTopics: KnowledgeTopic[];
//     relationshipScore: number;
//     currentDialogueNode: string;
//     dialogueHints: DialogueHint[];
//     questOffered?: Quest;
//     questProgressed?: QuestId;
//     flagsUpdated: Record<FlagKey, FlagValue>;
//     failReason?: 'npc_not_in_room' | 'npc_dead' | 'in_combat';
// }
//
// export interface TradeParams {
//     npcId: NpcId;
//     offerGold?: number;
//     offerItemIds?: ItemId[];
//     requestItemIds?: ItemId[];
//     requestGold?: number;
// }
//
// export interface TradeResult {
//     success: boolean;
//     itemsReceived: Item[];
//     itemsGiven: Item[];
//     goldTransferred: number;
//     npcResponse: string;
//     flagsUpdated: Record<FlagKey, FlagValue>;
//     failReason?: 'insufficient_gold' | 'item_not_in_npc_inventory' | 'npc_refuses' | 'player_lacks_offer_item';
// }
//
// export interface CheckStatusResult {
//     health: number;
//     maxHealth: number;
//     healthProse: HealthProse;
//     stats: PlayerStats;
//     gold: number;
//     activeEffects: ActiveEffect[];
//     activeQuests: QuestSummary[];
//     currentRoomId: RoomId;
//     turnCount: number;
//     equippedWeapon: Item | null;
//     equippedArmor: Item | null;
// }
//
// export interface GetFlagParams {
//     key: FlagKey;
// }
// export interface GetFlagResult {
//     key: FlagKey;
//     value: FlagValue | null;
//     setAtTurn?: number;
// }
//
// export interface SetFlagParams {
//     key: FlagKey;
//     value: FlagValue;
// }
// export interface SetFlagResult {
//     key: FlagKey;
//     value: FlagValue;
//     previousValue: FlagValue | null;
// }
