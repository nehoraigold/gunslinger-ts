export interface Interactable {
    addInteraction(interaction: string, interactionDescription: string): void
    interact(interaction: string, interactionData?: unknown): string
}
