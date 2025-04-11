import { register, login, updateUser } from "../controllers/authController.js";
import express from "express";
const router = express.Router();
import rateLimiter from "express-rate-limit";
import authenticateUser from "../middlewares/auth.js";

// Rate limiter configuration
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased from 10 to 100 for testing
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// 🔴 Fix 1: Correct controller reference for login
router.route("/register").post(apiLimiter, register);
router.route("/login").post(apiLimiter, login); // Changed loginUser -> login

// 🔴 Fix 2: Add authentication to protected routes
router.route("/updateUser").patch(authenticateUser, updateUser);

// Remove unused test route
// router.route("/user").get((req, res) => { ... });

export default router;