import { Signer, Provider, Message } from '@lay2/pw-core';
export declare class MultiKeySigner extends Signer {
    providers: Provider[];
    constructor(providers: Provider[] | Provider);
    /**
     *
     * @param messages grouped inputs by lock, element is a object including first input index and digest message for corresponding group
     * @returns
     */
    signMessages(messages: Message[]): Promise<string[]>;
}
