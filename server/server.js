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

const PORT = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// ------------ MIDDLEWARE ------------ //
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Security middleware
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// ------------ ROUTES ------------ //
// API Routes
app.get("/api/v1", (req, res) => {
  res.json({ message: "Welcome to Jobify API!" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

// Static files (React build) - Only in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../client/build")));
  
  // React client fallback
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

// ------------ ERROR HANDLERS ------------ //
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// ------------ DATABASE & SERVER ------------ //
const start = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env file");
    }

    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => 
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

start();