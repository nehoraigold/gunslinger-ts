export interface Wallet {
    balance(): number;
    canAfford(amount: number): boolean;
    credit(amount: number): void;
    debit(amount: number): void;
}
