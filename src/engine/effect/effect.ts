import { Exit } from '../../domain/exit';

export type MovePlayerEffect = {
    type: 'move_player';
    toRoomId: string;
};

export type SetItemQuantityEffect = {
    type: 'set_item_quantity';
    inventoryId: string;
    itemId: string;
    quantity: number;
};

export type AddNpcToRoomEffect = {
    type: 'add_npc_to_room';
    roomId: string;
    npcId: string;
};

export type RemoveNpcFromRoomEffect = {
    type: 'remove_npc_from_room';
    roomId: string;
    npcId: string;
};

export type SetExitStateEffect = {
    type: 'set_exit_state';
    exitId: string;
    stateKey: keyof Exit['state'];
    value: any;
};

export type SetFlagEffect = {
    type: 'set_flag';
    flag: string;
    value: boolean;
};

export type Effect =
    | MovePlayerEffect
    | SetItemQuantityEffect
    | SetFlagEffect
    | SetExitStateEffect
    | AddNpcToRoomEffect
    | RemoveNpcFromRoomEffect;
