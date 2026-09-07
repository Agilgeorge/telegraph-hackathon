"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyController_1 = require("../controllers/verifyController");
const router = (0, express_1.Router)();
router.post('/', verifyController_1.verifyController);
exports.default = router;
