import { BlessedBox, BlessedScreen } from './screen';
import { GameState } from '../engine/state/GameState';
import { derivePlayerStats } from '../engine/player/derivePlayerStats';
import { isAlive } from '../engine/npc/npcUtils';

function hpBar(current: number, max: number, width = 10): string {
    const ratio = Math.max(0, Math.min(1, current / max));
    const filled = Math.round(ratio * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const color = ratio > 0.6 ? 'green' : ratio > 0.3 ? 'yellow' : 'red';
    return `{${color}-fg}${bar}{/${color}-fg}`;
}

export class Sidebar {
    constructor(
        private readonly box: BlessedBox,
        private readonly screen: BlessedScreen,
    ) {}

    update(state: GameState): void {
        const { player, world, combat } = state;
        const playerStats = derivePlayerStats(player, world.items);

        const weaponItem = player.equippedWeapon ? world.items[player.equippedWeapon] : null;
        const armorItem = player.equippedArmor ? world.items[player.equippedArmor] : null;

        const room = world.rooms[player.currentRoomId];
        const roomName = room?.name ?? '???';

        const exits = room
            ? room.exits.map((exit) => {
                  const dir = exit.direction[0].toUpperCase();
                  const dest =
                      exit.destinationKnown && world.rooms[exit.destinationRoomId]?.visited
                          ? (world.rooms[exit.destinationRoomId]?.name ?? '???')
                          : '???';
                  const blocked = exit.isBlocked ? ` [blocked]` : '';
                  return `  ${dir} → ${dest}${blocked}`;
              })
            : [];

        const npcNames = room
            ? room.npcIds
                  .map((id) => {
                      const npc = world.npcs[id];
                      return npc && isAlive(npc) ? npc.name : null;
                  })
                  .filter((n): n is string => n !== null)
            : [];

        const lines: string[] = [];

        lines.push(`{bold}${player.name}{/bold}`);
        lines.push(`Lv: ${player.level} | XP: ${player.xp}`);
        lines.push('');
        lines.push(`HP ${hpBar(player.health, player.maxHealth)}`);
        lines.push(`   ${player.health} / ${player.maxHealth}`);
        lines.push('');
        lines.push(`  ATK: ${playerStats.attackPower}  DEF: ${playerStats.defense}`);
        lines.push('');
        lines.push(`  Weapon: ${weaponItem?.name ?? 'None'}`);
        lines.push(`  Armor:  ${armorItem?.name ?? 'None'}`);
        lines.push(`  Gold:   ${player.gold}`);
        lines.push(`  Turn:   ${state.turnCount}`);
        lines.push('');

        // Combat section
        if (combat) {
            const enemy = world.npcs[combat.enemyId];
            if (enemy) {
                lines.push('{red-fg}── COMBAT ──{/red-fg}');
                lines.push(`Round: ${combat.round}`);
                lines.push(`{bold}${enemy.name}{/bold}`);
                lines.push(`HP ${hpBar(enemy.health, enemy.maxHealth)}`);
                lines.push(`   ${enemy.health} / ${enemy.maxHealth}`);
                lines.push('');
            }
        }

        lines.push('{cyan-fg}── LOCATION ──{/cyan-fg}');
        lines.push(`${roomName}`);
        if (exits.length > 0) {
            lines.push('Exits:');
            exits.forEach((e) => lines.push(e));
        }
        if (npcNames.length > 0) {
            lines.push('');
            lines.push(`Here: ${npcNames.join(', ')}`);
        }
        lines.push('');

        this.box.setContent(lines.join('\n'));
        this.screen.render();
    }
}
