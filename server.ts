// This file sets up the main server and connects to MongoDB


import express, {Express} from "express"
import path from "path"
import router from "./src/index"
import morgan from "morgan"
import mongoose, { Connection } from 'mongoose'
import dotenv from "dotenv"

dotenv.config()

const app: Express = express()
//Set port
const port: number = parseInt(process.env.PORT as string) || 3001

// Connect to MongoDB
const mongoDB: string = "mongodb://localhost:27017/testdb"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection

db.on("error", console.error.bind(console, "MongoDB connection error"))

//Middleware to parse JSON and form data
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(morgan("dev"))

//Frontend files from 'public' folder
app.use(express.static(path.join(__dirname, "../public")))

//Main router
app.use("/", router)

//Start server
app.listen(port, () => {
    console.log( `Server running on port ${port}`)
})