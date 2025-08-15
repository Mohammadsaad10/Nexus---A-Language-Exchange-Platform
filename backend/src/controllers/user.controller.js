import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js"

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id; // req.user is set by the protectRoute middleware.
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and : [
                {_id : {$ne : currentUserId}}, //Exclude current user from being displayed in recommendations. $ne - not equal to 
                {_id : {$nin : currentUser.friends}}, //Exclude current user's friends. $nin - not in.
                {isOnboarded : true},
            ],
        });
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error in getRecommendedUsers controller",error.message);
        res.status(500).json({ message : "Internal Server Error!"});
    }
}

export async function getMyFriends(req,res){
    try {
        const user = await User.findById(req.user.id).select("friends").
        populate("friends"," fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json( {message : "Internal Server Error!"});
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id; //req.user is set by the protectRoute middleware.
        const  { id : recipientId } = req.params; //Id of friend req recipient.

        //'req.params' gives object with params => {id : '123'}.
        //  'req.params.id' gives the actual String id value '123'.
        // And here we need the object so we use 'req.params' to destructure it. 

        //To prevent sending a friend request to oneself.
        if(myId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself!" });
        }

        //Check if recipient exists.
        const recipient = await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({ message: "User not found!" });
        }

        //Check if user is already a friend.
        if(recipient.friends.includes(myId)){
            return res.status(400).json({ message : "You are already friends with this user!"});
        }

        //Check if friend request already exists.
        const existingRequest = await FriendRequest.findOne({
            $or : [
                { sender : myId, recipient : recipientId },
                { sender : recipientId, recipient : myId },
            ]
        });

        if(existingRequest) {
            return res
            .status(400)
            .json({ message : "Friend request already exists between you and this user!"});
        }

        //create a new friend request.
        const friendRequest = await FriendRequest.create({
            sender : myId,
            recipient : recipientId,
        });

        res.status(201).json(friendRequest);
    } catch (error) {
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
        
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const {id: requestId} = req.params;

        //check if the request exists.
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({ message : "Friend request not found!"});
        }

        //Check if the current user is the recipient of the request.
        if(friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message : "You are not authorized to accept this friend request!"});
        }

        friendRequest.status = "accepted"; // Update the status of the friend request to accepted.
        await friendRequest.save();

        
       // add each user to the other's friends array
       // $addToSet: adds elements to an array only if they do not already exist.
       await User.findByIdAndUpdate(friendRequest.sender, {
         $addToSet: { friends: friendRequest.recipient },
       });

       await User.findByIdAndUpdate(friendRequest.recipient, {
         $addToSet: { friends: friendRequest.sender },
       });

       res.status(200).json({ message: "Friend request accepted" });

    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequests( req,res) {
    try {
        const incomingRequests = await FriendRequest.find({ 
            recipient : req.user.id,
            status : "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedRequests = await FriendRequest.find({
            sender : req.user.id,
            status : "accepted",
        }).populate("recipient", "fullName profilePic");

        res.status(200).json({ incomingRequests, acceptedRequests});
    } catch (error) {
        console.log("Error in getFriendRequests controller", error.message);
        res.status(500).json({ message : "Internal Server Error!"});
    }
}

export async function getOutGoingFriendRequests( req,res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender : req.user.id,
            status : "pending",
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log("Error in getOutGoingFriendRequests controller", error.message);

        res.status(500).json({ message : "Internal Server Error!"});
    }
}