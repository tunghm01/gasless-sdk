"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = exports.randomInRange = exports.rng = exports.DEFAULT_RANDOM_SIZE = void 0;
const crypto_1 = require("crypto");
const bn = BigInt;
exports.DEFAULT_RANDOM_SIZE = 32; // 32-bytes
function rng(size = exports.DEFAULT_RANDOM_SIZE) {
    return bn(`0x${(0, crypto_1.randomBytes)(size).toString("hex")}`);
}
exports.rng = rng;
function randomInRange(min, max) {
    min = bn(min);
    max = bn(max);
    if (min < bn(0) || max < bn(0))
        throw new Error("Negative ranges are not supported");
    if (max <= min)
        throw new Error('"max" must be at least equal to "min" plus 1');
    const entropy = rng();
    const rangeFromZero = entropy % (max - min + bn(1));
    return rangeFromZero + min;
}
exports.randomInRange = randomInRange;
function sha256(msg) {
    return (0, crypto_1.createHash)("sha256").update(msg).digest("hex");
}
exports.sha256 = sha256;
