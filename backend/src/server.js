import express from 'express';
import 'dotenv/config';


import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";


import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

import cors from 'cors'; //cors is used to allow requests from different origins. like -> backend running on 5001 getting requests from frontend running on 5173.
import path from 'path';


const app = express();
const PORT = process.env.PORT;

// Configure CORS based on environment.
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? ["http://localhost:5001"]
    : ["http://localhost:5173", "http://localhost:5001"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json()); //for parsing JSON bodies.
app.use(cookieParser()); //for parsing cookies.

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

const _dirname = path.resolve();

if(process.env.NODE_ENV === "production"){
   // Serve static files from the React app
   app.use(express.static(path.join(_dirname, '../frontend/dist')));

   // Handle React routing, return all requests to React app
   app.get('*', (req, res) => {
      res.sendFile(path.join(_dirname, '../frontend/dist/index.html'));
   });
}

app.listen(PORT, ()=> {
    connectDB();
    console.log(`Server started at http://localhost:${PORT}`);
});


// just noting the flow for chatpage -->
// chatpage -> api.js -> server.js -> chat.route.js -> chat.controller.js -> stream.js.
