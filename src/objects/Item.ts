//region imports
import { IItem } from "../types/objects/IItem";
//endregion

export class Item implements IItem {
    public readonly name: string;
    public description: string;
    public isTransferable: boolean;
    public value: number;
    private interactions: Map<string, string>;

    constructor(name: string, description?: string, isTransferable?: boolean, value?: number) {
        this.name = name;
        this.description = description || "";
        this.isTransferable = isTransferable || false;
        this.value = value || 0;
        this.interactions = new Map<string, string>();
    }

    addInteraction(interaction: string, interactionDescription: string): void {
        this.interactions.set(interaction, interactionDescription);
    }

    interact(interaction: string, interactionData?: unknown): string {
        if (interaction === "examine") {
            return this.description;
        }
        return this.interactions.get(interaction) || "";
    }
}
