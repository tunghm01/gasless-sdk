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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSolution = exports.getPuzzle = exports.getPendingPuzzles = exports.sendToGasless = exports.getGaslessInfo = exports.getNetwork = void 0;
const axios_1 = __importDefault(require("axios"));
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
const configs_json_1 = __importDefault(require("../configs.json"));
function getNetwork(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const genesisHash = yield connection.getGenesisHash();
        const network = configs_json_1.default.find((obj) => obj.genesisHash === genesisHash);
        if (!network) {
            throw new Error(`Network is unknown. Please connect to Renec mainnet or testnet.`);
        }
        return network;
    });
}
exports.getNetwork = getNetwork;
function getGaslessInfo(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const network = yield getNetwork(connection);
        const response = (yield axios_1.default.get(network.gasLessServiceURL, {
            headers: { Accept: "application/json" },
        })).data;
        const feePayer = new web3_js_1.PublicKey(response.feePayer);
        return { feePayer };
    });
}
exports.getGaslessInfo = getGaslessInfo;
function sendToGasless(connection, signed, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const network = yield getNetwork(connection);
        const buff = signed.serialize({ requireAllSignatures: false });
        const serializedBs58 = bs58_1.default.encode(buff);
        const response = (yield axios_1.default.post(network.gasLessServiceURL + `/${type}/submit`, {
            transaction: serializedBs58,
        })).data;
        const txid = response === null || response === void 0 ? void 0 : response.signature;
        return txid;
    });
}
exports.sendToGasless = sendToGasless;
function getPendingPuzzles(connection, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const network = yield getNetwork(connection);
        const response = (yield axios_1.default.get(network.gasLessServiceURL + `/v1/pow/pending-puzzles`, {
            headers: { Accept: "application/json" },
            params: {
                userAddress: address.toBase58(),
            },
        })).data;
        const pendingPuzzles = response === null || response === void 0 ? void 0 : response.pendingPuzzles;
        return pendingPuzzles;
    });
}
exports.getPendingPuzzles = getPendingPuzzles;
function getPuzzle(connection, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const network = yield getNetwork(connection);
        const response = (yield axios_1.default.get(network.gasLessServiceURL + `/v1/pow/puzzle`, {
            headers: { Accept: "application/json" },
            params: {
                userAddress: address.toBase58(),
            },
        })).data;
        const puzzle = response === null || response === void 0 ? void 0 : response.puzzle;
        return puzzle;
    });
}
exports.getPuzzle = getPuzzle;
function postSolution(connection, rawSolution, signed) {
    return __awaiter(this, void 0, void 0, function* () {
        const network = yield getNetwork(connection);
        const buff = signed.serialize({ requireAllSignatures: false });
        const serializedBs58 = bs58_1.default.encode(buff);
        const response = (yield axios_1.default.post(network.gasLessServiceURL + `/v1/pow/solution`, {
            solution: rawSolution,
            transaction: serializedBs58,
        })).data;
        const txid = response === null || response === void 0 ? void 0 : response.signature;
        return txid;
    });
}
exports.postSolution = postSolution;
