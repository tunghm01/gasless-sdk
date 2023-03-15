/// <reference types="node" />
import { Address } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
/**
 * @category Util
 */
export type PDA = {
    publicKey: PublicKey;
    bump: number;
};
/**
 * @category Util
 */
export declare class AddressUtil {
    static toPubKey(address: Address): PublicKey;
    static toPubKeys(addresses: Address[]): PublicKey[];
    static findProgramAddress(seeds: (Uint8Array | Buffer)[], programId: PublicKey): PDA;
}
