"use strict";
//middleware functions for JWT token validation
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//validate JWT token
const validateToken = (req, res, next) => {
    //get token from the authorization header
    const token = req.header('authorization')?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Token not found." });
        return;
    }
    try {
        //verify token and attach user data to the request
        const verified = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        req.user = verified;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Token not found." });
    }
};
exports.validateToken = validateToken;
