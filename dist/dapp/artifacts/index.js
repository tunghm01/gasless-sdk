"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadArtifacts = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@project-serum/anchor");
const whirlpool_json_1 = __importDefault(require("./whirlpool.json"));
const dappsDevnet = [
    {
        name: "NemoSwap",
        programId: "7yyFRQehBQjdSpWYV93jWh4558YbWmc4ofbMWzKTPyJL",
        idl: whirlpool_json_1.default,
    },
];
const dappsTestnet = [
    {
        name: "NemoSwap",
        programId: "7yyFRQehBQjdSpWYV93jWh4558YbWmc4ofbMWzKTPyJL",
        idl: whirlpool_json_1.default,
    },
];
const dappsMainnet = [
    {
        name: "NemoSwap",
        programId: "7rh7ZtPzHqdY82RWjHf1Q8NaQiWnyNqkC48vSixcBvad",
        idl: whirlpool_json_1.default,
    },
];
const dapps = {
    devnet: dappsDevnet,
    testnet: dappsTestnet,
    mainnet: dappsMainnet,
};
function loadArtifacts(network) {
    const artifacts = [];
    // use network to get dapps info
    if (network.name !== "devnet" && network.name !== "testnet" && network.name !== "mainnet") {
        throw new Error("network is unsupport");
    }
    const _dapps = dapps[network.name];
    if (_dapps.length > 0) {
        _dapps.forEach((dapp) => {
            artifacts.push({
                name: dapp.name,
                programId: new web3_js_1.PublicKey(dapp.programId),
                coder: new anchor_1.BorshCoder(dapp.idl),
            });
        });
    }
    return artifacts;
}
exports.loadArtifacts = loadArtifacts;
