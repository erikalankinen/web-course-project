//file defines Mongoose model and schema for columns

import mongoose, { Document, Schema, Types } from 'mongoose'

interface IColumn extends Document {
    title: string
    userId: Types.ObjectId
    place: Number           //order of columns
    createdAt: Date
    updatedAt: Date
}

let columnSchema: Schema = new Schema({
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    place: { type: Number},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    updatedAt: {type: Date}
})


const Column: mongoose.Model<IColumn> = mongoose.model<IColumn>("Column", columnSchema)

export {Column, IColumn}