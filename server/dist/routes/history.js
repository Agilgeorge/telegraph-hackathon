"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordVerification = recordVerification;
const express_1 = require("express");
const router = (0, express_1.Router)();
// In-memory store for MVP — swap for DB later
const history = [];
function recordVerification(result) {
    history.unshift(result);
    if (history.length > 100)
        history.pop();
}
router.get('/', (_req, res) => {
    res.json(history.slice(0, 20));
});
exports.default = router;
