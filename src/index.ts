import PWCore, {
  Address,
  AddressType,
  Amount,
  IndexerCollector,
  RawProvider,
  Builder,
  BuilderOption,
  CellDep,
  DepType,
  OutPoint,
} from '@lay2/pw-core';
import {ChangeLockBuilder} from './change-lock-builder';
import {MultiKeySigner} from './multi-key-signer';

const PRIVATE_KEY1 = 'PUT_YOUR_PRIVATE_KEY_HERE';
const PRIVATE_KEY2 = 'PUT_YOUR_PRIVATE_KEY_HERE';

const TO_ADDRESS = 'ckt1qyqd5eyygtdmwdr7ge736zw6z0ju6wsw7rssu8fcve';

const NODE_URL = 'https://testnet.ckb.dev';
const CKB_INDEXER_URL = 'https://testnet.ckb.dev/indexer';

async function testChangeLock() {
  const rawProvider = new RawProvider(PRIVATE_KEY1);
  const feeProvider = new RawProvider(PRIVATE_KEY2);

  const collecotr = new IndexerCollector(CKB_INDEXER_URL);

  const multiKeySigner = new MultiKeySigner([rawProvider, feeProvider]);
  const pwcore = await new PWCore(NODE_URL).init(rawProvider, collecotr);

  await rawProvider.init();
  await feeProvider.init();

  const toAddress = new Address(TO_ADDRESS, AddressType.ckb);
  const sendAmount = new Amount('100'); // send amount is 100 CKB
  const option: BuilderOption = {
    witnessArgs: Builder.WITNESS_ARGS.RawSecp256k1,
  };
  const defaultLockDep = new CellDep(
    DepType.depGroup,
    new OutPoint(
      '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
      '0x0'
    )
  );

  console.log('feeAddress', feeProvider.address);
  console.log('rawAddress', rawProvider.address);

  const builder = new ChangeLockBuilder(
    rawProvider.address,
    toAddress,
    feeProvider.address,
    sendAmount,
    collecotr,
    option,
    [defaultLockDep]
  );

  const tx = await builder.build();
  console.log('tx', JSON.stringify(tx, null, 2));

  const txhash = await pwcore.sendTransaction(builder, multiKeySigner);
  console.log('txhash is', txhash);
}

testChangeLock();
