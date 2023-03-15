"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadArtifacts = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@project-serum/anchor");
const whirlpool_json_1 = __importDefault(require("./whirlpool.json"));
const exampleDapps = [
    {
        name: "NemoSwap",
        programId: "7Vd9eYAH2MZxD6LYHEnDs8Eko9Bx3UydvtNvnJ8vKW21",
        idl: whirlpool_json_1.default,
    },
];
function loadArtifacts(network) {
    const artifacts = [];
    // user network to get dapps info
    const dapps = exampleDapps; // get from gasless
    if (dapps.length > 0) {
        dapps.forEach((dapp) => {
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
