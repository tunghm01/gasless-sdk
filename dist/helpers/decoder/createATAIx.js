"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCreateAssociatedTokenInstructionUnchecked = exports.decodeCreateAssociatedTokenInstruction = exports.createAssociatedTokenInstructionData = void 0;
const buffer_layout_1 = require("@solana/buffer-layout");
const spl_token_1 = require("@solana/spl-token");
const types_1 = require("./types");
const errors_1 = require("./errors");
exports.createAssociatedTokenInstructionData = (0, buffer_layout_1.struct)([
    (0, buffer_layout_1.u8)("instruction"),
]);
function decodeCreateAssociatedTokenInstruction(instruction, programId = spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID) {
    if (!instruction.programId.equals(programId))
        throw new errors_1.TokenInvalidInstructionProgramError();
    if (instruction.data.length !== 0 &&
        instruction.data.length !== exports.createAssociatedTokenInstructionData.span)
        throw new errors_1.TokenInvalidInstructionDataError();
    const { keys: { fundingAccount, ataAccount, wallet, mint, systemProgram, splTokenProgram }, data, } = decodeCreateAssociatedTokenInstructionUnchecked(instruction);
    if (data.instruction !== types_1.AssociatedTokenInstruction.Create)
        throw new errors_1.TokenInvalidInstructionTypeError();
    if (!fundingAccount || !ataAccount || !wallet || !mint || !systemProgram || !splTokenProgram)
        throw new errors_1.TokenInvalidInstructionKeysError();
    return {
        programId,
        keys: { fundingAccount, ataAccount, wallet, mint, systemProgram, splTokenProgram },
        data,
    };
}
exports.decodeCreateAssociatedTokenInstruction = decodeCreateAssociatedTokenInstruction;
function decodeCreateAssociatedTokenInstructionUnchecked({ programId, keys: [fundingAccount, ataAccount, wallet, mint, systemProgram, splTokenProgram], data, }) {
    return {
        programId,
        keys: {
            fundingAccount,
            ataAccount,
            wallet,
            mint,
            systemProgram,
            splTokenProgram,
        },
        data: data.length > 0
            ? exports.createAssociatedTokenInstructionData.decode(data)
            : { instruction: types_1.AssociatedTokenInstruction.Create }, // default is create
    };
}
exports.decodeCreateAssociatedTokenInstructionUnchecked = decodeCreateAssociatedTokenInstructionUnchecked;
