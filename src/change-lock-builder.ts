import {
  BuilderOption,
  Builder,
  Address,
  Amount,
  Cell,
  RawTransaction,
  Transaction,
  CellDep,
  WitnessArgs,
  IndexerCollector,
} from '@lay2/pw-core';

// change cell's lock and another address provide fee cell for the tx
export class ChangeLockBuilder extends Builder {
  constructor(
    private fromAddress: Address,
    private toAddress: Address,
    private feeAddress: Address,
    private sendAmount: Amount,
    private indexerCollector: IndexerCollector,
    protected options: BuilderOption = {},
    private cellDeps: CellDep[],
    private since: string = '0x0'
  ) {
    super(options.feeRate, options.collector, options.witnessArgs);
  }

  async build(): Promise<Transaction> {
    const inputCells: Cell[] = [];
    const outputCells: Cell[] = [];

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
      neededAmount: new Amount('62'),
    });
    console.log('feeCells', feeCells);
    const feeCell = feeCells[0].clone();
    const changeCell = feeCells[0].clone();
    inputCells.push(feeCell);
    outputCells.push(changeCell);

    const rawTx = new RawTransaction(inputCells, outputCells, this.cellDeps);

    for (let i = 0; i < rawTx.inputs.length - 1; i++) {
      rawTx.inputs[i].since = this.since;
    }

    const witnessArgs: (string | WitnessArgs)[] = rawTx.inputs.map(_ => '0x');

    // set witness args for the raw provider input
    witnessArgs[0] = this.witnessArgs;

    // set witness args for the fee provider input
    witnessArgs[witnessArgs.length - 1] = Builder.WITNESS_ARGS.RawSecp256k1;

    const tx = new Transaction(rawTx, witnessArgs);

    this.fee = Builder.calcFee(tx, this.feeRate);
    changeCell.capacity = changeCell.capacity.sub(this.fee);

    tx.raw.outputs.pop();
    tx.raw.outputs.push(changeCell);
    return tx;
  }

  getCollector() {
    return this.collector;
  }
}
