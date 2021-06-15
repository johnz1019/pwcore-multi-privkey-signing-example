import {Signer, Provider, Blake2bHasher, Message} from '@lay2/pw-core';

export class MultiKeySigner extends Signer {
  providers: Provider[] = [];
  constructor(providers: Provider[] | Provider) {
    super(new Blake2bHasher());
    if (Array.isArray(providers)) {
      this.providers = providers;
    } else {
      this.providers = [providers];
    }
  }

  /**
   *
   * @param messages grouped inputs by lock, element is a object including first input index and digest message for corresponding group
   * @returns
   */
  async signMessages(messages: Message[]) {
    const sigs = [];

    // set signature to message
    for (const message of messages) {
      let matched = false;
      for (const provider of this.providers) {
        if (
          provider.address.toLockScript().toHash() === message.lock.toHash()
        ) {
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
