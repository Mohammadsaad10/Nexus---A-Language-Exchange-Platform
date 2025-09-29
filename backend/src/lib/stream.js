import { StreamChat } from 'stream-chat';
import 'dotenv/config';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){ 
    console.error("Stream API key or secret is missing!");
}

// Initialize the StreamChat client with the API key and secret.
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// upserting means create or update.
export const upsertStreamUser = async (userData) =>{
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
    // Returning userData:
    // -Doesn’t mean the user came from Stream.
    // -It's the same object you passed in, returned back for further use.
    // -You can use it further for token generation.
  } catch (error) {
    console.error("Error upserting Stream user :",error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    //ensure userId is a String
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.log("Error generating Stream token: ", error);
  }
}
