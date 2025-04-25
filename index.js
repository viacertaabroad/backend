import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import connectToDb from "./config/dbConfig.js";
import { createServer } from "http";
import cors from "cors";
// import socketFn from "./chatbot/socketConnector.js";
import {
  userRoutes,
  blogRoutes,
  coursesRoutes,
  mbbsRoutes,
  ourStudentsRoutes,
  enquiryRoutes,
  adminRoutes,
  googleAuthRoute,
  ticketRoutes,
  sseRoute,
} from "./helpers/indexRouteImports.js";
import checkRoutes from "./routes/check.js";
import cookieParser from "cookie-parser";
import { authorizedRole, isAuthenticatedUser } from "./middleware/auth.js";

import cluster from "cluster";
import os from "os";
// import process from "process";
import whatsAppRoute from "./whatsapp/routes/whatsappRoutes.js";
import { initializeWhatsappSocket } from "./whatsapp/utils/socketHandler.js";
import { isRedisConnected, redis } from "./config/redisConfig.js";
import { initChatbot } from "./chatbot/index.js";
cluster.schedulingPolicy = cluster.SCHED_RR; // Set round-robin scheduling policy
const numCPUs = os.cpus().length;
const port = process.env.PORT || 8000;
// console.log("number of CPUs: ", numCPUs);

// if (cluster.isPrimary) {
//   console.log(`🛠️ Master process ${process.pid} is running`);
//   console.log(`Using scheduling policy: ${cluster.schedulingPolicy}`);

//   for (let i = 0; i < 2  ; i++) {
//     cluster.fork(); // Fork workers
//   }

//   cluster.on("exit", (worker) => {
//     console.error(
//       `⚠️ Worker ${worker.process.pid} crashed. Restarting in 3s...`
//     );
//     setTimeout(() => cluster.fork(), 3000); // Restart the worker after 3s
//   });

//   // Graceful shutdown for master process
//   process.on("SIGTERM", () => {
//     console.log(`❌ Master process ${process.pid} shutting down...`);
//     // Killing workers gracefully
//     for (const id in cluster.workers) {
//       cluster.workers[id].kill();
//     }
//     process.exit(0); // Exit master process
//   });

//   process.on("SIGINT", () => {
//     console.log("Master process is shutting down...");
//     process.exit(0); // Exit master process
//   });
// } 
// else {
// Worker process logic
connectToDb(); // Database connection for each worker

const app = express();
const server = createServer(app);

// Initialize separate WhatsApp socket.io
const whatsappIo = initializeWhatsappSocket(server);

// socketFn(server); // Set up socket for communication in chatBot-Room
initChatbot(server);

app.use(
  cors({
    origin: ["https://viacerta-abroad.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/check",checkRoutes);
app.use("/api/whatsapp", whatsAppRoute);
app.use("/events", sseRoute);
app.use("/auth", googleAuthRoute);
// /////////////////////////
// All   API routes

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
app.use("/api/tickets", ticketRoutes);
// ------------

server.listen(port, (req, res) => {
  console.log(`🚀 Server is running on port: ${port} and process pid : ${process.pid}`);
  
  // Verify Redis connection after startup
  redis.ping()
    .then(() => { 
      console.log("🎟️  isRedisConnection status ? : ", isRedisConnected());})
    .catch(() => console.log("⚠️ Redis not available"));
  
  // console.log(`🚀 Worker ${process.pid} running on port: ${port}`);
});

// /////////////////////////////////////////////////
// Graceful shutdown for worker process
process.on("SIGTERM", () => {
  console.log(`❌ Worker ${process.pid} shutting down...`);
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log(`Worker ${process.pid} is shutting down...`);
  process.exit(0); // Exit worker process
});
// }

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1); // Exit process on uncaught exceptions
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1); // Exit process on unhandled rejections
});
// }