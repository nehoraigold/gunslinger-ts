export interface Health {
    current(): number;
    max(): number;
    isAlive(): boolean;
    heal(amount: number): void;
    damage(amount: number): void;
}
