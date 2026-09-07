"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.shortId = shortId;
const crypto_1 = require("crypto");
function sha256(input) {
    return (0, crypto_1.createHash)('sha256').update(input).digest('hex');
}
function shortId(input) {
    return (0, crypto_1.createHash)('md5').update(input).digest('hex').slice(0, 8);
}
