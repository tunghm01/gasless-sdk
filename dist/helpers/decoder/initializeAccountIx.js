"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeInitializeAccountInstructionUnchecked = exports.decodeInitializeAccountInstruction = exports.initializeAccountInstructionData = void 0;
const buffer_layout_1 = require("@solana/buffer-layout");
const spl_token_1 = require("@solana/spl-token");
const types_1 = require("./types");
const errors_1 = require("./errors");
/** TODO: docs */
exports.initializeAccountInstructionData = (0, buffer_layout_1.struct)([
    (0, buffer_layout_1.u8)("instruction"),
]);
/**
 * Decode an InitializeAccount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
function decodeInitializeAccountInstruction(instruction, programId = spl_token_1.TOKEN_PROGRAM_ID) {
    if (!instruction.programId.equals(programId))
        throw new errors_1.TokenInvalidInstructionProgramError();
    if (instruction.data.length !== exports.initializeAccountInstructionData.span)
        throw new errors_1.TokenInvalidInstructionDataError();
    const { keys: { account, mint, owner, rent }, data, } = decodeInitializeAccountInstructionUnchecked(instruction);
    if (data.instruction !== types_1.TokenInstruction.InitializeAccount)
        throw new errors_1.TokenInvalidInstructionTypeError();
    if (!account || !mint || !owner || !rent)
        throw new errors_1.TokenInvalidInstructionKeysError();
    // TODO: key checks?
    return {
        programId,
        keys: {
            account,
            mint,
            owner,
            rent,
        },
        data,
    };
}
exports.decodeInitializeAccountInstruction = decodeInitializeAccountInstruction;
/**
 * Decode an InitializeAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
function decodeInitializeAccountInstructionUnchecked({ programId, keys: [account, mint, owner, rent], data, }) {
    return {
        programId,
        keys: {
            account,
            mint,
            owner,
            rent,
        },
        data: exports.initializeAccountInstructionData.decode(data),
    };
}
exports.decodeInitializeAccountInstructionUnchecked = decodeInitializeAccountInstructionUnchecked;
