"use strict";
// This file sets up the main server and connects to MongoDB
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./src/index"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
//Set port
const port = parseInt(process.env.PORT) || 3001;
// Connect to MongoDB
const mongoDB = "mongodb://localhost:27017/testdb";
mongoose_1.default.connect(mongoDB);
mongoose_1.default.Promise = Promise;
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
//Middleware to parse JSON and form data
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)("dev"));
//Frontend files from 'public' folder
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
//Main router
app.use("/", index_1.default);
//Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
