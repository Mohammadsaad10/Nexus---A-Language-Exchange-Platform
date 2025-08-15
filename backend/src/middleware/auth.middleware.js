import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        // Check if the request has a JWT token in cookies.
        const token = req.cookies.jwt;

        if(!token) {
            return res.status(401).json({ message: "Unauthorized - no token provided!"});
        }

        //Verify the token.
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if(!decoded) {
            return res.status(401).json({ message : "Unauthorized - invalid token!"});
        }

        //Find the user associated with the token.
        //userId is extracted from the token payload and provided from controller inside the token.
        //We use select("-password") to exclude the password field from the user object.
        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(401).json({ message : "Unauthorized - user not found!"});
        }

        req.user = user; //Attach user to request object for further use in the route.

        next(); //Proceed to the next middleware or route handler.



    } catch (error) {
        console.log("Error in protectRoute middleware", error);
        res.status(500).json({ message : "Internal server error!"});
    }
}