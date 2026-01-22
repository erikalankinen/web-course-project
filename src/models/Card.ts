//File defines Mongoose model and schema for cards

import mongoose, { Document, Schema, Types } from 'mongoose'

interface ICard extends Document {
    title: string
    content: string
    createdAt: Date
    columnId: Types.ObjectId
    place: Number               //order of the card within column
    userId: Types.ObjectId
    color: string
    updatedAt?: Date
    comments: {text: string; timestamp: Date} [] //list of comments
}

let cardSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    place: { type: Number },
    columnId: {type: Schema.Types.ObjectId, ref: 'Column', required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    color: {type: String, default: "ffffff"},
    updatedAt: {type: Date},
    comments: [{text: String, timestamp: {type: Date, default: Date.now}}]
})


const Card: mongoose.Model<ICard> = mongoose.model<ICard>("Card", cardSchema)

export {Card, ICard}