import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import path from "path";
import ConnectMongoDBSession from "connect-mongodb-session";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// connect db
connectMongoDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(cookieParser(process.env.COOKIE_SECRET));

const MongoDBStore = ConnectMongoDBSession(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoDBStore({
      uri: process.env.MONGO_DB_URI,
      collection: "session",
    }),
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.message = req.flash();
  res.locals.user = req.session.user || null;
  next();
});

app.set("view engine", "ejs");
app.use("/", authRoutes);
app.use("/", postRoutes);

app.listen(PORT, () =>
  console.log(`✅ Server is running at http://localhost:${PORT}`)
);
