import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data; // returns new user and success message. user fields -> email,fullName, password, profilePic: randomAvatar
  //also cookie is sent with response.
}

export const getAuthuser = async () => {
      const res = await axiosInstance.get('/auth/me');
      return res.data;      //return user and success message. {success : true, user : req.user} + cookie associated with response.
}

export const completeOnboarding = async (userData) => {
     const res = await axiosInstance.post('/auth/onboarding',userData);
     return res.data; //return updated user and success message. {success : true, user : updatedUser} + cookie associated with response.
}

export const login = async (loginData) => {
    const res = await axiosInstance.post('/auth/login', loginData);
    return res.data; //returns user and success message. {success : true, user : req.user} + cookie associated with response.
}

export const logout = async () => {
   const res = await axiosInstance.post('/auth/logout');
   return res.data; //returns success message. {success : true, message : "User logged out successfully!"}
}

export const getUserFriends = async () => {
  const response = await axiosInstance.get("/users/friends");
  return response.data;  //returns array of friends associated with user.  res.status(200).json(user.friends) 
}

export const getRecommendedUsers = async() => {
  const response = await axiosInstance.get("/users");
  return response.data; //returns array of recommended users. res.status(200).json(recommendedUsers)
}

export const getOutgoingFriendReqs = async() => {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data; //returns array of outgoing friend requests.  res.status(200).json(outgoingRequests)
}

export const sendFriendRequest = async (receiverId) => {
  const response = await axiosInstance.post(`/users/friend-request/${receiverId}`);
  return response.data; // returns created friend request between sender and reciever. res.status(201).json(friendRequest)
}

export const getFriendRequests = async() => {
  const response = await axiosInstance.get('/users/friend-requests');
  return response.data; //returns array of friend requests. res.status(200).json({ incomingRequests, acceptedRequests})
}

export const acceptFriendRequest = async(requestId) => {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response; //updates status of friend request to accepted. saves it to database. then add each user to the other's friends array. and returns success message.
}

export const getStreamToken = async() =>{
  const response = await axiosInstance.get('/chat/token');
  return response.data; //returns token. res.status(200).json({token});
}