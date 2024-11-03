"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
//connect redis
const articleQueue = new bull_1.default('articleQueue', {
    redis: {
        host: 'localhost',
        port: 6379
    }
});
exports.default = articleQueue;
