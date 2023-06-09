"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtil = exports.U64_MAX = exports.U128 = exports.TWO = exports.ONE = exports.ZERO = void 0;
const anchor_1 = require("@project-serum/anchor");
const decimal_js_1 = __importDefault(require("decimal.js"));
/**
 * @category Math
 */
exports.ZERO = new anchor_1.BN(0);
/**
 * @category Math
 */
exports.ONE = new anchor_1.BN(1);
/**
 * @category Math
 */
exports.TWO = new anchor_1.BN(2);
/**
 * @category Math
 */
exports.U128 = exports.TWO.pow(new anchor_1.BN(128));
/**
 * @category Math
 */
exports.U64_MAX = exports.TWO.pow(new anchor_1.BN(64)).sub(exports.ONE);
/**
 * @category Math
 */
class MathUtil {
    static toX64_BN(num) {
        return num.mul(new anchor_1.BN(2).pow(new anchor_1.BN(64)));
    }
    static toX64_Decimal(num) {
        return num.mul(decimal_js_1.default.pow(2, 64));
    }
    static toX64(num) {
        return new anchor_1.BN(num.mul(decimal_js_1.default.pow(2, 64)).floor().toFixed());
    }
    static fromX64(num) {
        return new decimal_js_1.default(num.toString()).mul(decimal_js_1.default.pow(2, -64));
    }
    static fromX64_Decimal(num) {
        return num.mul(decimal_js_1.default.pow(2, -64));
    }
    static fromX64_BN(num) {
        return num.div(new anchor_1.BN(2).pow(new anchor_1.BN(64)));
    }
    static shiftRightRoundUp(n) {
        let result = n.shrn(64);
        if (n.mod(exports.U64_MAX).gt(exports.ZERO)) {
            result = result.add(exports.ONE);
        }
        return result;
    }
    static divRoundUp(n0, n1) {
        const hasRemainder = !n0.mod(n1).eq(exports.ZERO);
        if (hasRemainder) {
            return n0.div(n1).add(new anchor_1.BN(1));
        }
        else {
            return n0.div(n1);
        }
    }
    static subUnderflowU128(n0, n1) {
        return n0.add(exports.U128).sub(n1).mod(exports.U128);
    }
}
exports.MathUtil = MathUtil;
