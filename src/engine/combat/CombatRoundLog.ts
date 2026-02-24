import { AttackType } from './AttackType';

export interface CombatRoundLog {
    round: number;
    playerDamageDealt: number;
    playerAttackType: AttackType;
    enemyDamageDealt: number;
    enemyAttackType: AttackType;
    playerHealthAfter: number;
    enemyHealthAfter: number;
}
