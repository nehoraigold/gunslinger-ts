export interface Interactable {
    AddInteraction(interaction: string, interactionDescription: string): void
    Interact(interaction: string, interactionData?: unknown): string
}
