"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POWSignature = void 0;
const bs58_1 = __importDefault(require("bs58"));
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const crypto_1 = require("./crypto");
class POWSignature {
    constructor(signer) {
        this.signer = signer;
    }
    signerAddress() {
        return this.signer.publicKey.toBase58();
    }
    signMessage(message) {
        const msgUint8 = new TextEncoder().encode(message);
        return bs58_1.default.encode(tweetnacl_1.default.sign.detached(msgUint8, this.signer.secretKey));
    }
    validateSignature(message, signature) {
        const msgUint8 = new TextEncoder().encode(message);
        const signatureUint8 = bs58_1.default.decode(signature);
        const pubKeyUint8 = bs58_1.default.decode(this.signerAddress());
        return tweetnacl_1.default.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8);
    }
    toMessage(msg) {
        return (0, crypto_1.sha256)(msg);
    }
}
exports.POWSignature = POWSignature;
