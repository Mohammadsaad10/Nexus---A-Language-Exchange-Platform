import express from 'express';
import 'dotenv/config';


import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import notificationRoutes from "./routes/notification.route.js";


import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

import cors from 'cors';

const app = express();
const PORT = process.env.PORT;

app.use(
    cors({
      origin : 'http://localhost:5173',
      credentials : true, //allow frontend to send cookies.
    })
);

app.use(express.json()); //for parsing JSON bodies.
app.use(cookieParser()); //for parsing cookies.

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(PORT, ()=> {
    connectDB();
    console.log(`Server started at http://localhost:${PORT}`);
});
