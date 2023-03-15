"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveATA = exports.resolveOrCreateATAs = exports.resolveOrCreateATA = void 0;
const spl_token_1 = require("@solana/spl-token");
const token_instructions_1 = require("../helpers/token-instructions");
const token_util_1 = require("./token-util");
const types_1 = require("./transactions/types");
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
function resolveOrCreateATA(connection, ownerAddress, tokenMint, getAccountRentExempt, wrappedSolAmountIn = BigInt(0), payer = ownerAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const instructions = yield resolveOrCreateATAs(connection, ownerAddress, [{ tokenMint, wrappedSolAmountIn }], getAccountRentExempt, payer);
        return instructions[0];
    });
}
exports.resolveOrCreateATA = resolveOrCreateATA;
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
function resolveOrCreateATAs(connection, ownerAddress, requests, getAccountRentExempt, payer = ownerAddress) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const nonNativeMints = requests.filter(({ tokenMint }) => !tokenMint.equals(spl_token_1.NATIVE_MINT));
        const nativeMints = requests.filter(({ tokenMint }) => tokenMint.equals(spl_token_1.NATIVE_MINT));
        if (nativeMints.length > 1) {
            throw new Error("Cannot resolve multiple WSolAccounts");
        }
        let instructionMap = {};
        if (nonNativeMints.length > 0) {
            const nonNativeAddresses = yield Promise.all(nonNativeMints.map(({ tokenMint }) => deriveATA(ownerAddress, tokenMint)));
            const tokenAccountInfos = yield connection.getMultipleAccountsInfo(nonNativeAddresses);
            const tokenAccounts = tokenAccountInfos.map((tai) => token_util_1.TokenUtil.deserializeTokenAccount(tai === null || tai === void 0 ? void 0 : tai.data));
            tokenAccounts.forEach((tokenAccount, index) => {
                const ataAddress = nonNativeAddresses[index];
                let resolvedInstruction;
                if (tokenAccount) {
                    // ATA whose owner has been changed is abnormal entity.
                    // To prevent to send swap/withdraw/collect output to the ATA, an error should be thrown.
                    if (!tokenAccount.owner.equals(ownerAddress)) {
                        throw new Error(`ATA with change of ownership detected: ${ataAddress.toBase58()}`);
                    }
                    resolvedInstruction = Object.assign({ address: ataAddress }, types_1.EMPTY_INSTRUCTION);
                }
                else {
                    const createAtaInstruction = (0, spl_token_1.createAssociatedTokenAccountInstruction)(payer, ataAddress, ownerAddress, nonNativeMints[index].tokenMint);
                    resolvedInstruction = {
                        address: ataAddress,
                        instructions: [createAtaInstruction],
                        cleanupInstructions: [],
                        signers: [],
                    };
                }
                instructionMap[nonNativeMints[index].tokenMint.toBase58()] = resolvedInstruction;
            });
        }
        if (nativeMints.length > 0) {
            const accountRentExempt = yield getAccountRentExempt();
            const wrappedSolAmountIn = ((_a = nativeMints[0]) === null || _a === void 0 ? void 0 : _a.wrappedSolAmountIn) || BigInt(0);
            instructionMap[spl_token_1.NATIVE_MINT.toBase58()] = (0, token_instructions_1.createWSOLAccountInstructions)(ownerAddress, wrappedSolAmountIn, accountRentExempt);
        }
        // Preserve order of resolution
        return requests.map(({ tokenMint }) => instructionMap[tokenMint.toBase58()]);
    });
}
exports.resolveOrCreateATAs = resolveOrCreateATAs;
function deriveATA(ownerAddress, tokenMint) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, ownerAddress);
    });
}
exports.deriveATA = deriveATA;
