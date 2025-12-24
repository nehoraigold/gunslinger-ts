export interface InterpreterGameState {
  location: {
    name: string;
    description?: string;
  };

  visibleNPCs: Array<{
    name: string;
    aliases: string[];
  }>;

  visibleItems: Array<{
    name: string;
    aliases: string[];
    quantity?: number;
  }>;

  inventory: Array<{
    name: string;
    aliases: string[];
    quantity?: number;
  }>;
}