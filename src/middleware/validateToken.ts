//middleware functions for JWT token validation

import {Request, Response, NextFunction} from "express"
import jwt, {JwtPayload} from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

interface CustomRequest extends Request {
    user?: JwtPayload
}

//validate JWT token
export const validateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    //get token from the authorization header
    const token: string | undefined = req.header('authorization')?.split(" ")[1]

    if(!token) {
        res.status(401).json({message: "Token not found."})
        return
    }

    try {
        //verify token and attach user data to the request
        const verified: JwtPayload = jwt.verify(token, process.env.SECRET as string) as JwtPayload
        req.user = verified
        next()

    } catch (error: any) {
        res.status(401).json({message: "Token not found."})
    }
}