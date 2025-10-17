import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { searchRouter} from './routes/search.js';
import { filesRouter } from './routes/files.js';
import { chatRouter } from './routes/chat.js';
import { connectDB } from './config/database.js';
import { setupSocketIO } from './socket/chatSocket.js';
// import { researchPaperRouter } from './routes/research.js';
// import { archivesRouter } from './routes/archive.js';
// import { learnRouter } from './routes/learn.js';

export const app = express();

// Create HTTP server for Socket.IO
const server = createServer(app);

config({
    path: ".env",
});

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cookieParser());

// Enable CORS middleware with the configured options
app.use(cors({
    origin: true, // Allow all origins (for testing)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));


app.use("/api/search", searchRouter);
app.use("/api/files", filesRouter);
app.use("/api/chat", chatRouter);
// app.use("/api/learn", learnRouter);
// app.use("/api/research-papers", researchPaperRouter);
// app.use("/api/archives", archivesRouter);

// Setup Socket.IO
const io = setupSocketIO(server);

app.get("/", (req, res) => {
    res.send("Working with Chat System...");
});

server.listen(process.env.PORT, () => {
    console.log(
        `Server is working on port:${process.env.PORT} in ${process.env.NODE_ENV} Mode`
    );
    console.log('Chat system with Socket.IO enabled');
});