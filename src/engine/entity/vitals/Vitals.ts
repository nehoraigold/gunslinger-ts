export interface Vitals {
    current(): number;
    max(): number;
    isAlive(): boolean;
    heal(amount: number): void;
    damage(amount: number): void;
}
