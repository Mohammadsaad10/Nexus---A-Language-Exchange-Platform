import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';



export async function signup(req, res) {
    const {fullName, email, password } = req.body;

    try {
       //check if all fields are provided.
       if(!fullName || !email || !password ){
         return res.status(400).json({ message : "All fields are required!"});
       } 

       //check if password is at least 6 characters long .
       if(password.length < 6){
        return res.status(400).json({ message : "Password must be at least 6 characters long!"});
       }

       //check if email is in valid format.
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

       if(!emailRegex.test(email)){
        return res.status(400).json({ message : "Invalid email format!"});
       }
       
       //check if use already exists.
       const existingUser = await User.findOne({email});
       if(existingUser){
         return res.status(400).json({ message : "email already exists, please use a different one!"});
       }

       //generate a random avatar.
       const idx = Math.floor(Math.random() * 100 + 1); //generates num betn 1-100.
       const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

       //creating new user.
       const newUser = await User.create({
        email,
        fullName,
        password,
        profilePic: randomAvatar,
       });

       //upserting user in Stream.
       try {
        await upsertStreamUser({
            id : newUser._id.toString(), //converting ObjectId to string.
            // APIs like Stream Chat, or other frontend libraries, expect the id to be a plain string
            name : newUser.fullName,
            image : newUser.profilePic || "",
        });
        console.log(`Stream user upserted successfully for user : ${newUser.fullName}`);
       } catch (error) {
          console.log("Error creating/upserting Stream user", error);
       }

       //creating JWT token.
       //we are signing the token with userId and secret key, and setting expiration time to 7 days.
       const token  = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, { expiresIn: "7d"});

       res.cookie("jwt", token,{
        maxAge : 7 * 24 * 60 * 60 * 1000, //7 days in milliseconds
        httpOnly: true, // prevents XSS attacks.
        sameSite: "Strict", // prevents CSRF attacks.
        secure: process.env.NODE_ENV === "production", //ensures cookie is sent over HTTPS in production.
       });

       res.status(201).json({ success: true, user: newUser});
    } catch (error) {
        console.log("Error in signup controller",error);
        res.status(500).json({ message : "Internal server error!" });
    }
    
};
export async function login(req,res) {
    try {
        const {email, password} = req.body;

        //check if all fields are provided.
        if(!email || !password){
            res.status(400).json({ message : "All fields are required!"});
        }

        //checking if user exists
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({ message : "Invalid email or password!"});
        }

        //checking if password is correct.
        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect) return res.status(401).json({ message : "Invalid email or passoword!"});

        //creating JWT token.
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d",
        });

        //setting the cookie with token.
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            httpOnly: true, //prevents XSS attacks
            sameSite : "Strict", //prevents CSRF attacks
            secure : process.env.NODE_ENV === "production", //ensures cookie is sent over HTTPS in production
        });

        res.status(200).json({ success : true, user});

    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({ message : "Internal server error!"});        
    }
}


export function logout(req,res) {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logged out successfully!"});
}



export async function onboard(req,res) {
    try {
        const userId = req.user._id; //req.user is set by the protectRoute middleware.

        const { fullName, bio , nativeLanguage , learningLanguage , location } = req.body;

        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({ message : "All fields are required!",
                missingFields : [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean) //removes falsy values from the array(values that are not missing).
            });
        }

        //To find the user and update other fields from User schema like isOnboarded, which are by default false.
        //Also others like bio, nativeLanguage, learningLanguage, location,etc.

        const updatedUser = await User.findByIdAndUpdate(userId, 
            {
                ...req.body, //updates all fields with the values from req.body.
                isOnboarded : true,
            },
            {
                new : true  // returns updated user.
            }
        );


        if(!updatedUser) return res.status(401).json({ message : "User not found"});

        //upserting user in Stream , just to maintain consistency. 
        //safe practice.
        try {
            await upsertStreamUser({
                id : updatedUser._id.toString(),
                name : updatedUser.fullName,
                image : updatedUser.profilePic || "",
            });

            console.log(`Stream user upserted successfully for user : ${updatedUser.fullName}`);    
        } catch (streamError) {
            console.log("Error in updating Stream user during onboarding : ",streamError.message);
        }

        res.status(200).json({ success : true, user: updatedUser});
    } catch (error) {
        console.log("Onboarding error : ",error);
        res.status(500).json({ message : "Internal Server Error"});
    }
}