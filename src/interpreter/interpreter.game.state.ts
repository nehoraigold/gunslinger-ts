export type InterpreterItemState = {
    name: string;
    aliases: string[];
    quantity?: number;
};

export type InterpreterGameState = {
    location: {
        name: string;
        description?: string;
        visibleNPCs: Array<{
            name: string;
            aliases: string[];
            items: Array<InterpreterItemState>;
        }>;

        visibleItems: Array<InterpreterItemState>;
    };

    inventory: Array<InterpreterItemState>;
};
