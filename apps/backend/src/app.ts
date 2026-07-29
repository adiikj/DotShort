import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieparser from "cookie-parser";

dotenv.config();

const app = express();

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

import urlRouter from "./routes/url.routes.js";
app.use("/", urlRouter);

import userRouter from "./routes/user.routes.js";
app.use("/user", userRouter);

export { app };
