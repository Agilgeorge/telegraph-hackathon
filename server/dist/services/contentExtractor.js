"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractContent = extractContent;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const promises_1 = __importDefault(require("node:dns/promises"));
const node_net_1 = __importDefault(require("node:net"));
function isPrivateAddress(address) {
    if (node_net_1.default.isIPv4(address)) {
        const [first, second] = address.split('.').map(Number);
        return first === 10 || first === 127 || first === 0 ||
            (first === 169 && second === 254) ||
            (first === 172 && second >= 16 && second <= 31) ||
            (first === 192 && second === 168);
    }
    if (node_net_1.default.isIPv6(address)) {
        const normalized = address.toLowerCase();
        return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') ||
            normalized.startsWith('fe8') || normalized.startsWith('fe9') ||
            normalized.startsWith('fea') || normalized.startsWith('feb');
    }
    return true;
}
async function assertPublicUrl(value) {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
        throw new Error('Only public http(s) URLs can be fetched');
    }
    if (parsed.hostname === 'localhost' || parsed.hostname.endsWith('.localhost')) {
        throw new Error('Local URLs cannot be fetched');
    }
    const addresses = node_net_1.default.isIP(parsed.hostname)
        ? [parsed.hostname]
        : (await promises_1.default.lookup(parsed.hostname, { all: true })).map((entry) => entry.address);
    if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
        throw new Error('Private or local network URLs cannot be fetched');
    }
}
async function extractContent(url) {
    await assertPublicUrl(url);
    const requestOptions = {
        timeout: 10000,
        headers: { 'User-Agent': 'TrustMesh/1.0 (verification agent)' },
        maxRedirects: 0,
    };
    const response = await axios_1.default.get(url, requestOptions);
    const html = typeof response.data === 'string' ? response.data : String(response.data);
    const $ = cheerio.load(html.slice(0, 500000));
    // Remove noise
    $('script, style, nav, footer, header, aside, .ad, .advertisement').remove();
    const title = $('title').text().trim() || $('h1').first().text().trim();
    // Try article body first, fall back to main, then body
    const content = $('article').text().trim() ||
        $('main').text().trim() ||
        $('body').text().trim();
    return {
        title,
        content: content.replace(/\s+/g, ' ').slice(0, 3000),
        url,
    };
}
