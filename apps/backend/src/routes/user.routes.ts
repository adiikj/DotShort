import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginLimiter, registerLimiter, refreshLimiter } from "../middlewares/rateLimit.js";

const router = Router();

// Public Routes
router.post("/register", registerLimiter, registerUser); // User registration
router.post("/login", loginLimiter, loginUser); // User login
router.post("/refresh", refreshLimiter, refreshTokens); // Exchange refresh token for a new pair

// Protected Routes (Require Authentication)
router.post("/logout", verifyJWT, logoutUser); // User logout (JWT-protected)

router.get("/profile", verifyJWT, getProfile); // Get user profile (JWT-protected)
router.patch("/profile", verifyJWT, updateProfile); // Update name/username (JWT-protected)
router.put("/password", verifyJWT, changePassword); // Change password (JWT-protected)

export default router;
