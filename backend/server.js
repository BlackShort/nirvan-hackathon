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

// Define the whitelist of allowed origins for network access
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.137.135:5173', // Your local network IP
    'http://0.0.0.0:5173'
];

// Enable CORS middleware with the configured options
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, desktop apps, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
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