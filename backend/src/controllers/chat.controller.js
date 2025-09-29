import { generateStreamToken} from '../lib/stream.js';

export async function getStreamToken (req, res) {
    try {
        const token = generateStreamToken(req.user.id);
        res.status(200).json({token}); //token (string) is being converted to json because axiosInstance is configured to accept json data. ()
    } catch (error) {
        console.error("Error in getStreamToken controller :", error.message);
        res.status(500).json({ message: "Internal server error" });      
        
    }
}