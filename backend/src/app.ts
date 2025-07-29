import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { pinoHttp } from "pino-http";
import { log } from "./lib/logger";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerUiServe, swaggerUiSetup } from "./lib/swagger";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger: log }));

// API Docs
app.use("/api-docs", swaggerUiServe, swaggerUiSetup);

// API Routes
app.use("/", apiRouter);

// Central Error Handler
app.use(errorHandler);

export default app;
