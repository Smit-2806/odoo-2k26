import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Basic request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      status: "UP",
      database: "CONNECTED",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database connection failure:", error);
    res.status(500).json({
      success: false,
      status: "DEGRADED",
      database: "DISCONNECTED",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`[Server] VendorBridge backend running on port ${port}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("[Server] Database disconnected. Exiting.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("[Server] Database disconnected. Exiting.");
  process.exit(0);
});
