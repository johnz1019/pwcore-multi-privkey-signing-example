"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeLockBuilder = void 0;
const pw_core_1 = require("@lay2/pw-core");
// change cell's lock and another address provide fee cell for the tx
class ChangeLockBuilder extends pw_core_1.Builder {
    constructor(fromAddress, toAddress, feeAddress, sendAmount, indexerCollector, options = {}, cellDeps, since = '0x0') {
        super(options.feeRate, options.collector, options.witnessArgs);
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.feeAddress = feeAddress;
        this.sendAmount = sendAmount;
        this.indexerCollector = indexerCollector;
        this.options = options;
        this.cellDeps = cellDeps;
        this.since = since;
    }
    async build() {
        const inputCells = [];
        const outputCells = [];
        // indexer collector to collect cell
        const cells = await this.indexerCollector.collect(this.fromAddress, {
            neededAmount: this.sendAmount,
        });
        if (cells.length === 0) {
            throw new Error('no live cells, not neccessary to change lock');
        }
        for (const cell of cells) {
            inputCells.push(cell);
            const outputCell = cell.clone();
            outputCell.lock = this.toAddress.toLockScript();
            outputCells.push(outputCell);
        }
        // add fee cells from other lock to inputs and outpus
        const feeCells = await this.indexerCollector.collect(this.feeAddress, {
            neededAmount: new pw_core_1.Amount('62'),
        });
        console.log('feeCells', feeCells);
        const feeCell = feeCells[0].clone();
        const changeCell = feeCells[0].clone();
        inputCells.push(feeCell);
        outputCells.push(changeCell);
        const rawTx = new pw_core_1.RawTransaction(inputCells, outputCells, this.cellDeps);
        for (let i = 0; i < rawTx.inputs.length - 1; i++) {
            rawTx.inputs[i].since = this.since;
        }
        const witnessArgs = rawTx.inputs.map(_ => '0x');
        // set witness args for the raw provider input
        witnessArgs[0] = this.witnessArgs;
        // set witness args for the fee provider input
        witnessArgs[witnessArgs.length - 1] = pw_core_1.Builder.WITNESS_ARGS.RawSecp256k1;
        const tx = new pw_core_1.Transaction(rawTx, witnessArgs);
        this.fee = pw_core_1.Builder.calcFee(tx, this.feeRate);
        changeCell.capacity = changeCell.capacity.sub(this.fee);
        tx.raw.outputs.pop();
        tx.raw.outputs.push(changeCell);
        return tx;
    }
    getCollector() {
        return this.collector;
    }
}
exports.ChangeLockBuilder = ChangeLockBuilder;
//# sourceMappingURL=change-lock-builder.js.map