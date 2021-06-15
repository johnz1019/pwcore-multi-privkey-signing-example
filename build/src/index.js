"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pw_core_1 = require("@lay2/pw-core");
const change_lock_builder_1 = require("./change-lock-builder");
const multi_key_signer_1 = require("./multi-key-signer");
const PRIVATE_KEY1 = 'PUT_YOUR_PRIVATE_KEY_HERE';
const PRIVATE_KEY2 = 'PUT_YOUR_PRIVATE_KEY_HERE';
const TO_ADDRESS = 'ckt1qyqd5eyygtdmwdr7ge736zw6z0ju6wsw7rssu8fcve';
const NODE_URL = 'https://testnet.ckb.dev';
const CKB_INDEXER_URL = 'https://testnet.ckb.dev/indexer';
async function testChangeLock() {
    const rawProvider = new pw_core_1.RawProvider(PRIVATE_KEY1);
    const feeProvider = new pw_core_1.RawProvider(PRIVATE_KEY2);
    const collecotr = new pw_core_1.IndexerCollector(CKB_INDEXER_URL);
    const multiKeySigner = new multi_key_signer_1.MultiKeySigner([rawProvider, feeProvider]);
    const pwcore = await new pw_core_1.default(NODE_URL).init(rawProvider, collecotr);
    await rawProvider.init();
    await feeProvider.init();
    const toAddress = new pw_core_1.Address(TO_ADDRESS, pw_core_1.AddressType.ckb);
    const sendAmount = new pw_core_1.Amount('100'); // send amount is 100 CKB
    const option = {
        witnessArgs: pw_core_1.Builder.WITNESS_ARGS.RawSecp256k1,
    };
    const defaultLockDep = new pw_core_1.CellDep(pw_core_1.DepType.depGroup, new pw_core_1.OutPoint('0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37', '0x0'));
    console.log('feeAddress', feeProvider.address);
    console.log('rawAddress', rawProvider.address);
    const builder = new change_lock_builder_1.ChangeLockBuilder(rawProvider.address, toAddress, feeProvider.address, sendAmount, collecotr, option, [defaultLockDep]);
    const tx = await builder.build();
    console.log('tx', JSON.stringify(tx, null, 2));
    const txhash = await pwcore.sendTransaction(builder, multiKeySigner);
    console.log('txhash is', txhash);
}
testChangeLock();
//# sourceMappingURL=index.js.map