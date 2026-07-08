import { TrueCondition } from './conditions/true';
import { FalseCondition } from './conditions/false';
import { FlagValueCondition } from './conditions/flagValue';
import { HasItemCondition } from './conditions/hasItem';
import { LacksItemCondition } from './conditions/lacksItem';
import { RoomVisitedCondition } from './conditions/roomVisited';
import { NpcMoodCondition } from './conditions/npcMood';
import { NpcAliveCondition } from './conditions/npcAlive';
import { AndCondition } from './conditions/and';
import { OrCondition } from './conditions/or';
import { NotCondition } from './conditions/not';

export type Condition =
    | TrueCondition
    | FalseCondition
    | FlagValueCondition
    | HasItemCondition
    | LacksItemCondition
    | RoomVisitedCondition
    | NpcMoodCondition
    | NpcAliveCondition
    | AndCondition
    | OrCondition
    | NotCondition;
