export type UseEffect =
    | { type: 'heal'; value: number }
    | { type: 'damage'; value: number }
    | { type: 'poison'; damage: number; duration: number }
    | { type: 'unlock'; flagKey: string }
    | { type: 'revealLore'; text: string }
    | { type: 'applyBuff'; effectId: string; name: string; description: string; duration: number };
