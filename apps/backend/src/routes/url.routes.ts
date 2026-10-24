import { Router } from "express";
import {
  shortenUrl,
  redirectToLongUrl,
  validatePasswordAndRedirect,
  getUserLinks,
  updateLink,
  deleteUrl,
  getOverview,
  getLinkAnalytics,
  getAccountAnalytics,
} from "../controllers/url.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { shortenLimiter, passwordGuessLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/shorten", shortenLimiter, optionalVerifyJWT, shortenUrl);
router.get("/user-links", verifyJWT, getUserLinks);

// Analytics & management: registered before the /:shortCode catch-all.
router.get("/overview", verifyJWT, getOverview);
router.get("/analytics", verifyJWT, getAccountAnalytics);
router.get("/links/:shortCode/analytics", verifyJWT, getLinkAnalytics);
router.patch("/links/:shortCode", verifyJWT, updateLink);

// Public redirect comes last among GETs.
router.get("/:shortCode", redirectToLongUrl);
router.post("/validate-password", passwordGuessLimiter, validatePasswordAndRedirect);
router.delete("/delete/:shortCode", verifyJWT, deleteUrl);

export default router;
