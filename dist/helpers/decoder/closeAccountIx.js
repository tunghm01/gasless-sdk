"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCloseAccountInstructionUnchecked = exports.decodeCloseAccountInstruction = exports.closeAccountInstructionData = void 0;
const buffer_layout_1 = require("@solana/buffer-layout");
const spl_token_1 = require("@solana/spl-token");
const types_1 = require("./types");
const errors_1 = require("./errors");
/** TODO: docs */
exports.closeAccountInstructionData = (0, buffer_layout_1.struct)([(0, buffer_layout_1.u8)("instruction")]);
/**
 * Decode a CloseAccount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
function decodeCloseAccountInstruction(instruction, programId = spl_token_1.TOKEN_PROGRAM_ID) {
    if (!instruction.programId.equals(programId))
        throw new errors_1.TokenInvalidInstructionProgramError();
    if (instruction.data.length !== exports.closeAccountInstructionData.span)
        throw new errors_1.TokenInvalidInstructionDataError();
    const { keys: { account, destination, authority, multiSigners }, data, } = decodeCloseAccountInstructionUnchecked(instruction);
    if (data.instruction !== types_1.TokenInstruction.CloseAccount)
        throw new errors_1.TokenInvalidInstructionTypeError();
    if (!account || !destination || !authority)
        throw new errors_1.TokenInvalidInstructionKeysError();
    // TODO: key checks?
    return {
        programId,
        keys: {
            account,
            destination,
            authority,
            multiSigners,
        },
        data,
    };
}
exports.decodeCloseAccountInstruction = decodeCloseAccountInstruction;
/**
 * Decode a CloseAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
function decodeCloseAccountInstructionUnchecked({ programId, keys: [account, destination, authority, ...multiSigners], data, }) {
    return {
        programId,
        keys: {
            account,
            destination,
            authority,
            multiSigners,
        },
        data: exports.closeAccountInstructionData.decode(data),
    };
}
exports.decodeCloseAccountInstructionUnchecked = decodeCloseAccountInstructionUnchecked;
