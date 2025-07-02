//region imports
import { IItem } from "../types/objects/IItem";
//endregion

export class Item implements IItem {
    private readonly name: string;
    private description: string;
    private isTransferable: boolean;
    private value: number;
    private interactions: Map<string, string>;

    constructor(name: string, description?: string, isTransferable?: boolean, value?: number) {
        this.name = name;
        this.description = description || "";
        this.isTransferable = isTransferable || false;
        this.value = value || 0;
        this.interactions = new Map<string, string>();
    }

    get Name(): string {
        return this.name;
    }

    get Description(): string {
        return this.description;
    }

    set Description(description: string) {
        this.description = description;
    }

    get IsTransferable(): boolean {
        return this.isTransferable;
    }

    set IsTransferable(isTransferable: boolean) {
        this.isTransferable = isTransferable;
    }

    get Value(): number {
        return this.value;
    }

    set Value(value: number) {
        this.value = value;
    }

    AddInteraction(interaction: string, interactionDescription: string): void {
        this.interactions.set(interaction, interactionDescription);
    }

    Interact(interaction: string, interactionData?: unknown): string {
        if (interaction === "examine") {
            return this.Description;
        }
        return this.interactions.get(interaction) || "";
    }
}
