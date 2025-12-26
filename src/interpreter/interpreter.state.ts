export type InterpreterItemState = {
    name: string;
    aliases: string[];
    quantity?: number;
};

export type InterpreterState = {
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
