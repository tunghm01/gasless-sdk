import { Connection, PublicKey } from "@solana/web3.js";
import { ResolvedTokenAddressInstruction } from "../helpers/token-instructions";
/**
 * IMPORTANT: wrappedSolAmountIn should only be used for input/source token that
 *            could be SOL. This is because when SOL is the output, it is the end
 *            destination, and thus does not need to be wrapped with an amount.
 *
 * @param connection Solana connection class
 * @param ownerAddress The user's public key
 * @param tokenMint Token mint address
 * @param wrappedSolAmountIn Optional. Only use for input/source token that could be SOL
 * @param payer Payer that would pay the rent for the creation of the ATAs
 * @returns
 */
export declare function resolveOrCreateATA(connection: Connection, ownerAddress: PublicKey, tokenMint: PublicKey, getAccountRentExempt: () => Promise<number>, wrappedSolAmountIn?: bigint, payer?: PublicKey): Promise<ResolvedTokenAddressInstruction>;
type ResolvedTokenAddressRequest = {
    tokenMint: PublicKey;
    wrappedSolAmountIn?: BigInt;
};
/**
 * IMPORTANT: wrappedSolAmountIn should only be used for input/source token that
 *            could be SOL. This is because when SOL is the output, it is the end
 *            destination, and thus does not need to be wrapped with an amount.
 *
 * @param connection Solana connection class
 * @param ownerAddress The user's public key
 * @param tokenMint Token mint address
 * @param wrappedSolAmountIn Optional. Only use for input/source token that could be SOL
 * @param payer Payer that would pay the rent for the creation of the ATAs
 * @returns
 */
export declare function resolveOrCreateATAs(connection: Connection, ownerAddress: PublicKey, requests: ResolvedTokenAddressRequest[], getAccountRentExempt: () => Promise<number>, payer?: PublicKey): Promise<ResolvedTokenAddressInstruction[]>;
export declare function deriveATA(ownerAddress: PublicKey, tokenMint: PublicKey): Promise<PublicKey>;
export {};
