import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import connectToDb from "./config/dbConfig.js";

import { createServer } from "http";
import cors from "cors";
import socketFn from "./socketConnector.js";

import {
  userRoutes,
  blogRoutes,
  coursesRoutes,
  mbbsRoutes,
  ourStudentsRoutes,
  enquiryRoutes,
  adminRoutes,
  googleAuthRoute,
} from "./helpers/indexRouteImports.js";

import cookieParser from "cookie-parser";
import { authorizedRole, isAuthenticatedUser } from "./middleware/auth.js";
import { addClient } from "./utils/sseNotification.js";

import cluster from "cluster";
import os from "os";
import process from "process";

const numCPUs = os.cpus().length;
const port = process.env.PORT || 8000;

if (cluster.isPrimary) {
  console.log(`🛠️ Master process ${process.pid} is running`);
  console.log(`Using scheduling policy: ${cluster.schedulingPolicy}`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.error(
      `⚠️ Worker ${worker.process.pid} crashed. Restarting in 3s...`
    );
    setTimeout(() => cluster.fork(), 3000);
  });
} else {
  //server staring logic
  connectToDb();

  const app = express();
  const server = createServer(app);

  socketFn(server);

  app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ----
  // Testing Routes
  app.use("/demo", (req, res) => res.send("Hello World"));
  app.get("/health", (req, res) =>
    res.json({ status: "ok", worker: process.pid })
  );
  app.get("/workers", (req, res) => {
    console.log(`Worker ${process.pid} received a /workers request`);
    res.json({ message: `Worker ${process.pid} is handling requests` });
  });

  // ----
  // All Routes
  app.get("/events", (req, res) => addClient(res));

  app.use("/auth", googleAuthRoute); // /auth/google
  app.use("/api/user", userRoutes);
  app.use("/api/blogs", blogRoutes);
  app.use("/api/courses", coursesRoutes);
  app.use("/api/campaign", mbbsRoutes);
  app.use("/api/ourStudents", ourStudentsRoutes);
  app.use("/api/enquiry", enquiryRoutes);
  app.use(
    "/api/admin",
    isAuthenticatedUser,
    authorizedRole(["admin"]),
    adminRoutes
  );

  //

  server.listen(port, () => {
    console.log(`🚀 Worker ${process.pid} running on port: ${port}`);
  });

  // Graceful shutdown (without DB disconnection handling here)
  process.on("SIGTERM", () => {
    console.log(`❌ Worker ${process.pid} shutting down...`);
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("Server is shutting down...");
    process.exit(0); // Exit the process
  });
}

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  // console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
