"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanText = cleanText;
exports.truncate = truncate;
exports.isUrl = isUrl;
function cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
}
function truncate(text, max) {
    return text.length > max ? text.slice(0, max) + '...' : text;
}
function isUrl(value) {
    return value.startsWith('http://') || value.startsWith('https://');
}
