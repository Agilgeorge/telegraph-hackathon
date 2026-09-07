"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const verify_1 = __importDefault(require("./routes/verify"));
const health_1 = __importDefault(require("./routes/health"));
const history_1 = __importDefault(require("./routes/history"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express_1.default.json({ limit: '50kb' }));
app.use((0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Too many requests' },
}));
app.use('/health', health_1.default);
app.use('/api/verify', verify_1.default);
app.use('/api/history', history_1.default);
app.listen(PORT, () => {
    console.log(`TrustMesh server running on port ${PORT}`);
});
