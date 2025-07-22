import express from 'express';
import dotenv from 'dotenv';
import connectMongoDB from './db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectMongoDB();

//set template engine to ejs  
app.set('view engine', 'ejs');


// home route
app.get("/", (req, res) => {
    res.render("index", { title: 'Home-page' });
});   

app.use('/', authRoutes);


app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});
