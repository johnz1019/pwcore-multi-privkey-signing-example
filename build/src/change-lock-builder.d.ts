import { BuilderOption, Builder, Address, Amount, Transaction, CellDep, IndexerCollector } from '@lay2/pw-core';
export declare class ChangeLockBuilder extends Builder {
    private fromAddress;
    private toAddress;
    private feeAddress;
    private sendAmount;
    private indexerCollector;
    protected options: BuilderOption;
    private cellDeps;
    private since;
    constructor(fromAddress: Address, toAddress: Address, feeAddress: Address, sendAmount: Amount, indexerCollector: IndexerCollector, options: BuilderOption, cellDeps: CellDep[], since?: string);
    build(): Promise<Transaction>;
    getCollector(): import("@lay2/pw-core").Collector | import("@lay2/pw-core").SUDTCollector;
}
