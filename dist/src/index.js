"use strict";
// This file handles API routing
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("./models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inputValidation_1 = require("./validators/inputValidation");
const validateToken_1 = require("./middleware/validateToken");
const Card_1 = require("./models/Card");
const Column_1 = require("./models/Column");
const router = (0, express_1.Router)();
//Register a new user
router.post("/api/user/register", inputValidation_1.registerValidation, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.status(400).json({ errors: errors.array() });
    }
    else {
        try {
            const existingUser = await User_1.User.findOne({ email: req.body.email });
            if (existingUser) {
                res.status(403).json({ email: "Email already in use" });
            }
            else {
                //hash the password before saving
                const salt = bcrypt_1.default.genSaltSync(10);
                const hash = bcrypt_1.default.hashSync(req.body.password, salt);
                const newUser = await User_1.User.create({
                    email: req.body.email,
                    password: hash,
                    username: req.body.username,
                    isAdmin: req.body.isAdmin || false
                });
                res.status(200).json(newUser);
            }
        }
        catch (error) {
            console.error(`Error during registration: ${error}`);
            if (!res.headersSent) {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }
});
//Log in an existing user
router.post("/api/user/login", inputValidation_1.loginValidation, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.status(400).json({ errors: errors.array() });
    }
    else {
        try {
            const { email, password } = req.body;
            const user = await User_1.User.findOne({ email });
            if (user) {
                if (bcrypt_1.default.compareSync(password, user.password)) {
                    const jwtPayload = {
                        id: user._id,
                        email: user.email,
                        username: user.username
                    };
                    //generate a token valid for 10 minutes
                    const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET, { expiresIn: "10m" });
                    res.status(200).json({
                        success: true, token,
                        email: user.email,
                        username: user.username
                    });
                }
                else {
                    res.status(401).json({ message: "Login failed" });
                }
            }
            else {
                res.status(401).json({ message: "Login failed" });
            }
        }
        catch (error) {
            console.error(`Error during user login: ${error}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});
//get all columns for the user
router.get("/api/columns", validateToken_1.validateToken, async (req, res) => {
    try {
        const columns = await Column_1.Column.find({ userId: req.user.id });
        res.status(200).json(columns);
    }
    catch (error) {
        console.log(`Error while fecthing columns ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
//add a new column
router.post("/api/column", validateToken_1.validateToken, async (req, res) => {
    try {
        const { title } = req.body;
        const newColumn = new Column_1.Column({
            userId: req.user.id,
            title
        });
        await newColumn.save();
        res.status(200).json(newColumn);
    }
    catch (err) {
        res.status(500).json({ message: "Error adding column" });
    }
});
//delete a column and its cards
router.delete("/api/column/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const column = await Column_1.Column.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!column)
            return res.status(404).json({ message: "Column not found" });
        await Card_1.Card.deleteMany({ columnId: column._id });
        res.status(200).json({ message: "Column deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting column" });
    }
});
//update column title
router.put("/api/column/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const { title } = req.body;
        const updated = await Column_1.Column.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { title: title, updatedAt: new Date() }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Column not found" });
        }
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ message: "Error renaming column" });
    }
});
//private route
router.get("/api/private", validateToken_1.validateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Access granted",
        user: req.user
    });
});
//get all cards for a specific column
router.get("/api/column/:id/cards", validateToken_1.validateToken, async (req, res) => {
    try {
        const columnId = req.params.id;
        const cards = await Card_1.Card.find({ columnId, userId: req.user.id });
        res.status(200).json(cards);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching cards" });
    }
});
//add a new card
router.post("/api/card", validateToken_1.validateToken, async (req, res) => {
    try {
        const { title, content, columnId } = req.body;
        const newCard = new Card_1.Card({
            title,
            userId: req.user.id,
            columnId,
            content,
            color: req.body.color
        });
        await newCard.save();
        res.status(200).json(newCard);
    }
    catch (err) {
        res.status(500).json({ message: "Error adding card" });
    }
});
//delete a card
router.delete("/api/card/:id", validateToken_1.validateToken, async (req, res) => {
    try {
        const card = await Card_1.Card.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.status(200).json({ message: "Card deleted " });
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting card" });
    }
});
//move a card
router.put("/api/card/:id/move", validateToken_1.validateToken, async (req, res) => {
    try {
        const { columnId, place } = req.body;
        const card = await Card_1.Card.findOne({ _id: req.params.id, userId: req.user.id });
        if (!card)
            return res.status(404).json({ message: "Card not found" });
        card.columnId = columnId || card.columnId;
        card.place = place !== undefined ? place : card.place;
        card.updatedAt = new Date();
        await card.save();
        res.status(200).json(card);
    }
    catch (err) {
        res.status(500).json({ message: "Error moving card" });
    }
});
//add a comment to a card
router.post("/api/card/:id/comment", async (req, res) => {
    try {
        const cardId = req.params.id;
        const { text } = req.body;
        const card = await Card_1.Card.findById(cardId);
        card?.comments.push({
            text,
            timestamp: new Date()
        });
        await card?.save();
        res.status(200).json({ message: "Comment added" });
    }
    catch (err) {
        res.status(500).json({ message: "Error adding comment" });
    }
});
exports.default = router;
