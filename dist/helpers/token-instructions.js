"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWSOLAccountInstructions = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
// TODO use native-mint instead
function createWSOLAccountInstructions(walletAddress, amountIn, rentExemptLamports) {
    const tempAccount = new web3_js_1.Keypair();
    const createAccountInstruction = web3_js_1.SystemProgram.createAccount({
        fromPubkey: walletAddress,
        newAccountPubkey: tempAccount.publicKey,
        lamports: Number(amountIn) + rentExemptLamports,
        space: spl_token_1.AccountLayout.span,
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    });
    const initAccountInstruction = (0, spl_token_1.createInitializeAccountInstruction)(tempAccount.publicKey, spl_token_1.NATIVE_MINT, walletAddress);
    const closeWSOLAccountInstruction = (0, spl_token_1.createCloseAccountInstruction)(tempAccount.publicKey, walletAddress, walletAddress, []);
    return {
        address: tempAccount.publicKey,
        instructions: [createAccountInstruction, initAccountInstruction],
        cleanupInstructions: [closeWSOLAccountInstruction],
        signers: [tempAccount],
    };
}
exports.createWSOLAccountInstructions = createWSOLAccountInstructions;
