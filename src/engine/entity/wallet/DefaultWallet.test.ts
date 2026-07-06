import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultWallet } from './DefaultWallet';
import { InsufficientWalletBalanceError, NegativeWalletAmountError } from '../../error';

describe(DefaultWallet.name, () => {
    function createWallet(initialBalance = 0): DefaultWallet {
        let balance = initialBalance;
        return new DefaultWallet(
            () => balance,
            (next) => {
                balance = next;
            },
        );
    }

    describe('balance', () => {
        it('should return the current balance', () => {
            const wallet = createWallet(15);

            expect(wallet.balance()).to.equal(15);
        });
    });

    describe('canAfford', () => {
        it('should be true when the balance exceeds the amount', () => {
            const wallet = createWallet(10);

            expect(wallet.canAfford(4)).to.be.true;
        });

        it('should be true when the balance exactly equals the amount', () => {
            const wallet = createWallet(10);

            expect(wallet.canAfford(10)).to.be.true;
        });

        it('should be false when the balance is below the amount', () => {
            const wallet = createWallet(3);

            expect(wallet.canAfford(4)).to.be.false;
        });

        it('should throw when the amount is negative', () => {
            const wallet = createWallet(10);

            expect(() => wallet.canAfford(-1)).to.throw(NegativeWalletAmountError);
        });
    });

    describe('credit', () => {
        it('should increase the balance by the amount', () => {
            const wallet = createWallet(5);

            wallet.credit(7);

            expect(wallet.balance()).to.equal(12);
        });

        it('should throw when the amount is negative', () => {
            const wallet = createWallet(5);

            expect(() => wallet.credit(-1)).to.throw(NegativeWalletAmountError);
            expect(wallet.balance()).to.equal(5);
        });
    });

    describe('debit', () => {
        it('should decrease the balance by the amount', () => {
            const wallet = createWallet(10);

            wallet.debit(4);

            expect(wallet.balance()).to.equal(6);
        });

        it('should allow spending the entire balance', () => {
            const wallet = createWallet(10);

            wallet.debit(10);

            expect(wallet.balance()).to.equal(0);
        });

        it('should throw and leave the balance unchanged when funds are insufficient', () => {
            const wallet = createWallet(3);

            expect(() => wallet.debit(4)).to.throw(InsufficientWalletBalanceError);
            expect(wallet.balance()).to.equal(3);
        });

        it('should throw when the amount is negative', () => {
            const wallet = createWallet(10);

            expect(() => wallet.debit(-1)).to.throw(NegativeWalletAmountError);
            expect(wallet.balance()).to.equal(10);
        });
    });
});
