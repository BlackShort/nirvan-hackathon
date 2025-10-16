import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { searchRouter} from './routes/search.js';
// import { researchPaperRouter } from './routes/research.js';
// import { archivesRouter } from './routes/archive.js';
// import { learnRouter } from './routes/learn.js';

export const app = express();

config({
    path: ".env",
});

app.use(express.json());
app.use(cookieParser());

// Define the whitelist of allowed origins without double quotes
const allowedOrigins = ['http://localhost:3000'];

// Enable CORS middleware with the configured options
app.use(cors({
    origin: (origin, callback) => {
        // Use req.header('Origin') instead of origin directly
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use("/api/search", searchRouter);
// app.use("/api/learn", learnRouter);
// app.use("/api/research-papers", researchPaperRouter);
// app.use("/api/archives", archivesRouter);

app.get("/", (req, res) => {
    res.send("Working...");
});

app.listen(process.env.PORT, () => {
    console.log(
        `Server is working on port:${process.env.PORT} in ${process.env.NODE_ENV} Mode`
    );
});