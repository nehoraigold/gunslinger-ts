import { Player } from './Player';
import { CombatStats } from './CombatStats';
import { Item } from '../item';

// TODO: apply statModifiers from ActiveEffect.onTick when buff system is implemented
export function derivePlayerStats(player: Player, items: Record<string, Item>): CombatStats {
    const weapon = player.equippedWeapon ? items[player.equippedWeapon] : null;
    const armor = player.equippedArmor ? items[player.equippedArmor] : null;
    const { strength, endurance, agility } = player.baseStats;

    return {
        attackPower: strength + (weapon?.stats?.attackPower ?? 0),
        defense: endurance + (armor?.stats?.defense ?? 0),
        initiative: agility * (weapon?.stats?.speedModifier ?? 1.0),
    };
}
