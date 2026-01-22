"use strict";
//This file defines validation rules for registration and login forms
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
//validation rules for registration
exports.registerValidation = [
    (0, express_validator_1.body)("email")
        .isEmail().withMessage("Invalid email")
        .normalizeEmail()
        .trim()
        .escape(),
    (0, express_validator_1.body)("username")
        .isLength({ min: 3, max: 25 }).withMessage("Username must be 3-25 characters")
        .trim()
        .escape(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 8 }).withMessage("Password must have at least 8 characters")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character")
];
//Validation rules for login
exports.loginValidation = [
    (0, express_validator_1.body)("email")
        .isEmail().withMessage("Invalid email")
        .normalizeEmail()
        .trim()
        .escape(),
    (0, express_validator_1.body)("password")
        .notEmpty().withMessage("Password is required")
];
