import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import connectToDb from "./config/dbConfig.js";
import path from 'path';
import { createServer } from "http";
import cors from "cors";
import routes from "./helpers/indexRouteImports.js";
import cookieParser from "cookie-parser";
import { authorizedRole, isAuthenticatedUser } from "./middleware/auth.js";
import helmet from "helmet";
import xssClean from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import cluster from "cluster";
 
import { initializeWhatsappSocket } from "./whatsapp/utils/socketHandler.js";
import { isRedisConnected, redis } from "./config/redisConfig.js";
import { initChatbot } from "./chatbot/index.js";
import { sessionMiddleware } from "./utils/sessionUtils.js";
import uploadRoutes from "./routes/uploadRoutes.js";
cluster.schedulingPolicy = cluster.SCHED_RR; // Set round-robin scheduling policy
 
const port = process.env.PORT || 8000;
 
connectToDb();  
const uploadsPath = path.join(process.cwd(), '..', 'uploads');

const app = express();
app.set("trust proxy", "loopback");
// app.set('trust proxy', true);
app.disable("x-powered-by");
app.use(morgan("tiny"));
const server = createServer(app);

// Initialize separate WhatsApp socket.io
initializeWhatsappSocket(server);
// socketFn(server); // Set up socket for communication in chatBot-Room
initChatbot(server);

app.use(
  cors({
    origin: [
      "https://viacerta-abroad.onrender.com",
      "http://localhost:3000",
      "https://vps-domain.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.disable("x-powered-by");

app.use(helmet()); //Set Secure HTTP Headers
app.use(helmet.hidePoweredBy()); // Hide "X-Powered-By" header for all

app.use(xssClean()); //Prevent XSS attacks
app.use(mongoSanitize()); //  Prevent NoSQL Injection attacks
app.use((req, res, next) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next(); // Enable browser-based XSS protection
}); // Set Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      // ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      defaultSrc: ["'self'"], // Allow resources from the same origin
      scriptSrc: ["'self'", "https://trusted-cdn.com"], // Allow scripts from trusted sources
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (be careful with this)
      imgSrc: ["'self'", "data:"], // Allow images from the same origin and data URIs
      fontSrc: ["'self'"], // Allow fonts from the same origin
      objectSrc: ["'none'"], // Prevent Flash or other plugin-based content
      upgradeInsecureRequests: [], // Upgrade HTTP requests to HTTPS
      blockAllMixedContent: ["'block'"], // Block all mixed content (HTTP content loaded on HTTPS pages)
    },
  })
);

////////// Routes
app.use("/check", routes.checkRoutes);
app.use("/api/whatsapp", routes.whatsAppRoute);
app.use("/events", routes.sseRoute);
app.use("/auth", routes.googleAuthRoute);
// /////////////////////////

// Static file serving with caching and CORS headers
app.use('/view', express.static(uploadsPath, {
  maxAge: '1d', // Cache for one day
  etag: true,    // Enable ETag for caching
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow cross-origin requests
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}));
app.use('/api/upload', uploadRoutes); // this is for saving files


// /////////////////////////
// All   API routes

app.use("/api/user", sessionMiddleware, routes.userRoutes);
app.use("/api/blogs", routes.blogRoutes);
app.use("/api/courses", routes.coursesRoutes);
app.use("/api/campaign", routes.mbbsRoutes);
app.use("/api/ourStudents", routes.ourStudentsRoutes);
app.use("/api/enquiry", routes.enquiryRoutes);
app.use(
  "/api/admin",
  isAuthenticatedUser,
  authorizedRole(["admin"]),
  routes.adminRoutes
);
app.use("/api/tickets", routes.ticketRoutes);

app.post("/report-csp-violation", (req, res) => {
  console.log("CSP Violation Report:", req.body);
  // mail it or whatspp or excel save
  res.status(204).send(); // Respond with no content on violation
});

// ------------

server.listen(port, (req, res) => {
  console.log(
    `🚀 Server is running on port: ${port} and process pid : ${process.pid}`
  );

  // Verify Redis connection after startup
  redis
    .ping()
    .then(() => {
      console.log("🎟️  isRedisConnection status ? : ", isRedisConnected());
    })
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
