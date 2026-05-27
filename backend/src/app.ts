import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);

export default app;