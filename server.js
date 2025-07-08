import express from 'express';
import dotenv from 'dotenv';
import connectMongoDB from './db.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectMongoDB();

app.get("/", (req, res) => {
    res.send("Hello from Express.js");
});

app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});
