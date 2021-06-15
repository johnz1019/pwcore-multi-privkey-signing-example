"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiKeySigner = void 0;
const pw_core_1 = require("@lay2/pw-core");
class MultiKeySigner extends pw_core_1.Signer {
    constructor(providers) {
        super(new pw_core_1.Blake2bHasher());
        this.providers = [];
        if (Array.isArray(providers)) {
            this.providers = providers;
        }
        else {
            this.providers = [providers];
        }
    }
    /**
     *
     * @param messages grouped inputs by lock, element is a object including first input index and digest message for corresponding group
     * @returns
     */
    async signMessages(messages) {
        const sigs = [];
        // set signature to message
        for (const message of messages) {
            let matched = false;
            for (const provider of this.providers) {
                if (provider.address.toLockScript().toHash() === message.lock.toHash()) {
                    console.log('multi-key-signer', message.message);
                    sigs.push(await provider.sign(message.message));
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                sigs.push('0x');
            }
        }
        return sigs;
    }
}
exports.MultiKeySigner = MultiKeySigner;
//# sourceMappingURL=multi-key-signer.js.map