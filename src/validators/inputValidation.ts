//This file defines validation rules for registration and login forms

import { body } from "express-validator"

//validation rules for registration
export const registerValidation = [
  body("email")
    .isEmail().withMessage("Invalid email")
    .normalizeEmail()
    .trim()
    .escape(),

  body("username")
    .isLength({ min: 3, max: 25 }).withMessage("Username must be 3-25 characters")
    .trim()
    .escape(),

  body("password")
    .isLength({ min: 8 }).withMessage("Password must have at least 8 characters")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character")
]

//Validation rules for login
export const loginValidation = [
  body("email")
    .isEmail().withMessage("Invalid email")
    .normalizeEmail()
    .trim()
    .escape(),

  body("password")
    .notEmpty().withMessage("Password is required")
]
