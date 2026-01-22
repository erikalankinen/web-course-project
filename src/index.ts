// This file handles API routing

import {Request, Response, Router} from "express"
import { body, Result, ValidationError, validationResult } from 'express-validator'
import bcrypt from "bcrypt"
import { User, IUser } from "./models/User"
import jwt, { JwtPayload } from "jsonwebtoken"
import { registerValidation, loginValidation } from "./validators/inputValidation"
import { validateToken } from "./middleware/validateToken"
import { Card } from "./models/Card"
import { Column } from "./models/Column"



const router: Router = Router()

//Register a new user
router.post("/api/user/register", 
  registerValidation,
  async (req: Request, res: Response) => {
    const errors: Result<ValidationError> = validationResult(req)

    if (!errors.isEmpty()) {
      console.log(errors);
      res.status(400).json({ errors: errors.array() })
    } else {
      try {
        const existingUser: IUser | null = await User.findOne({ email: req.body.email })

        if (existingUser) {
          res.status(403).json({ email: "Email already in use" })
        } else {
          //hash the password before saving
          const salt: string = bcrypt.genSaltSync(10)
          const hash: string = bcrypt.hashSync(req.body.password, salt)

          const newUser = await User.create({
            email: req.body.email,
            password: hash, 
            username: req.body.username,
            isAdmin: req.body.isAdmin || false
          })

          res.status(200).json(newUser)
        }

      } catch (error: any) {
        console.error(`Error during registration: ${error}`)
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    }
  }
)

//Log in an existing user
router.post("/api/user/login",
  loginValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors)
        res.status(400).json({ errors: errors.array() })
    } else {
        try {
            const { email, password } = req.body
            const user: IUser | null = await User.findOne({ email })

            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    const jwtPayload: JwtPayload = {
                        id: user._id,
                        email: user.email, 
                        username: user.username
                    }
                    //generate a token valid for 10 minutes
                    const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, { expiresIn: "10m" })

                    res.status(200).json({
                      success: true, token,
                      email: user.email,
                      username: user.username
                    })

                } else {
                    res.status(401).json({ message: "Login failed" })
                }
            } else {
                res.status(401).json({ message: "Login failed" })
            }

        } catch (error: any) {
            console.error(`Error during user login: ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }
})
//get all columns for the user
router.get("/api/columns", validateToken, async (req: any, res: Response) => {
  try {
    const columns = await Column.find({ userId: req.user.id })
    res.status(200).json(columns)
  } catch (error: any) {
    console.log(`Error while fecthing columns ${error}`)
    res.status(500).json({ message: "Internal Server Error" })
  }
})
//add a new column
router.post("/api/column", validateToken, async (req: any, res: Response) => {
  try {
    const { title } = req.body
    const newColumn = new Column({
      userId: req.user.id,
      title
    })

    await newColumn.save()
    res.status(200).json(newColumn)
  } catch (err) {
    res.status(500).json({ message: "Error adding column" })
  }
})
//delete a column and its cards
router.delete("/api/column/:id", validateToken, async (req: any, res: Response) => {
  try {
    const column = await Column.findOneAndDelete({_id: req.params.id, userId: req.user.id})
    if (!column) return res.status(404).json({message: "Column not found"})
    await Card.deleteMany({ columnId: column._id })
    res.status(200).json({ message: "Column deleted successfully." })
  } catch (err) {
    res.status(500).json({ message: "Error deleting column" })
  }
})
//update column title
router.put("/api/column/:id", validateToken, async (req: any, res: Response) => {
  try {
    const {title} = req.body
    const updated = await Column.findOneAndUpdate(
    {_id: req.params.id, userId: req.user.id},
    {title: title, updatedAt: new Date()},
    {new: true}
    )
    if (!updated) {
      return res.status(404).json({message: "Column not found"})

    }
    res.status(200).json(updated)
  } catch (err) {
    res.status(500).json({message: "Error renaming column"})
  }
})
//private route
router.get("/api/private", validateToken, (req: any, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Access granted",
    user: req.user
  })
})
//get all cards for a specific column
router.get("/api/column/:id/cards", validateToken, async (req: any, res: Response) => {
  try {
    const columnId = req.params.id
    const cards = await Card.find({ columnId, userId: req.user.id })
    res.status(200).json(cards)
  } catch (err) {
    res.status(500).json({ message: "Error fetching cards" })
  }
})
//add a new card
router.post("/api/card", validateToken, async (req: any, res: Response) => {
  try {
    const { title, content, columnId } = req.body
    const newCard = new Card ({
      title,
      userId: req.user.id,
      columnId,
      content,
      color: req.body.color
    })
    await newCard.save()
    res.status(200).json(newCard)
  } catch (err) {
    res.status(500).json({ message: "Error adding card" })
  }
})
//delete a card
router.delete("/api/card/:id", validateToken, async (req: any, res: Response) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    res.status(200).json({ message: "Card deleted "})
  } catch (err) {
    res.status(500).json({ message: "Error deleting card" })
  }
})
//move a card
router.put("/api/card/:id/move", validateToken, async (req: any, res: Response) => {
  try {
    const {columnId, place } = req.body
    const card = await Card.findOne({_id: req.params.id, userId: req.user.id})
  if (!card) return res.status(404).json( {message : "Card not found"})

    card.columnId = columnId || card.columnId
    card.place = place !== undefined ? place : card.place

    card.updatedAt = new Date()
        
    await card.save()
    res.status(200).json(card)
  } catch (err) {
    res.status(500).json({ message: "Error moving card"})
  }
})
//add a comment to a card
router.post("/api/card/:id/comment", async (req, res) => {
  try {
    const cardId = req.params.id
    const {text} = req.body
    const card = await Card.findById(cardId)

    card?.comments.push({
      text,
      timestamp: new Date()
    })

    await card?.save()
    res.status(200).json({message: "Comment added"})
  } catch (err) {
    res.status(500).json({message: "Error adding comment"})
  }
})

export default router