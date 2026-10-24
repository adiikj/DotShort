import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieparser from "cookie-parser";
import { globalLimiter } from "./middlewares/rateLimit.js";
import { errorHandler } from "./middlewares/err.middleware.js";

dotenv.config();

const app = express();

// Required for real client IPs (rate limiting) and correct req.protocol when
// deployed behind a proxy (Render/Railway/nginx). Set TRUST_PROXY=1 in prod.
const trustProxy = Number(process.env.TRUST_PROXY ?? 0);
app.set("trust proxy", Number.isFinite(trustProxy) ? trustProxy : 0);

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieparser());
app.options("*", cors(corsOptions));

app.use(globalLimiter);

import urlRouter from "./routes/url.routes.js";
app.use("/", urlRouter);

import userRouter from "./routes/user.routes.js";
app.use("/user", userRouter);

// JSON 404 for unmatched routes (Express' default is an HTML page).
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: [],
  });
});

// Must be registered last: converts thrown ApiErrors (and anything unexpected)
// into consistent JSON responses.
app.use(errorHandler);

export { app };
