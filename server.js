import express from 'express';
import dotenv from 'dotenv';
import connectMongoDB from './db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectMongoDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false }));

// cookie middlewares
app.use(cookieParser(process.env.COOKIE_SECRET));

// session  middlewares
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000*60*24*7 // 1 week
    }
}));

// flash messages middlewares
app.use(flash());

// stored flash message for views
app.use(function (req, res, next ) {
    res.locals.message = req.flash();
    next();
})


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
