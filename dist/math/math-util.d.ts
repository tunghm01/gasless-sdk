/// <reference types="bn.js" />
import { BN } from "@project-serum/anchor";
import Decimal from "decimal.js";
/**
 * @category Math
 */
export declare const ZERO: BN;
/**
 * @category Math
 */
export declare const ONE: BN;
/**
 * @category Math
 */
export declare const TWO: BN;
/**
 * @category Math
 */
export declare const U128: BN;
/**
 * @category Math
 */
export declare const U64_MAX: BN;
/**
 * @category Math
 */
export declare class MathUtil {
    static toX64_BN(num: BN): BN;
    static toX64_Decimal(num: Decimal): Decimal;
    static toX64(num: Decimal): BN;
    static fromX64(num: BN): Decimal;
    static fromX64_Decimal(num: Decimal): Decimal;
    static fromX64_BN(num: BN): BN;
    static shiftRightRoundUp(n: BN): BN;
    static divRoundUp(n0: BN, n1: BN): BN;
    static subUnderflowU128(n0: BN, n1: BN): BN;
}
