import express from "express";
const app = express();
import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import jobsRouter from "./routes/jobsRouter.js";
import notFoundMiddleware from "./middlewares/not-found.js";
import errorHandlerMiddleware from "./middlewares/error-handler.js";
import authenticateUser from "./middlewares/auth.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const PORT = process.env.PORT || 5000; // Correct variable name
const __dirname = dirname(fileURLToPath(import.meta.url));

// ------------ MIDDLEWARE ------------ //
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable preflight requests for all routes
 // Handle preflight requests

// ------------ ROUTES ------------ //
app.use(express.static(path.resolve(__dirname, "../client/build")));
app.get("/api/v1", (req, res) => {
  res.json("Welcome!");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

// React client fallback
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// ------------ DB CONNECT & START ------------ //
const start = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env file");
    }

    mongoose.set("strictQuery", true); // Suppress Mongoose warning
    console.log("Connecting to:", process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);

    app.listen(PORT, () =>
      console.log(`✅ Server is running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
  }
};

start();
