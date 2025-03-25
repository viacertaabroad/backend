import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import connectToDb from "./config/dbConfig.js"; // Add `.js` to avoid ESM errors
import userRoutes from "./routes/usersRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import coursesRoutes from "./routes/coursesRoute.js";
import mbbsRoutes from "./routes/campaignRoute.js";
import ourStudentsRoutes from "./routes/ourStudentsRoute.js";
import EnquiryRoutes from "./routes/enquiryRoute.js";
import AdminRoutes from "./routes/adminRoute.js";
import googleAuthRoute from "./routes/googleAuthRoute.js";

// import { createServer } from "http";
import cors from "cors";
// import socketFn from "./socketConnector.js";

import cookieParser from "cookie-parser";
import { authorizedRole, isAuthenticatedUser } from "./middleware/auth.js";

const app = express();
// const server = createServer(app);
const port = process.env.PORT || 8000;
// socketFn(server);

// .............................................................

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

// .................................................................

//  .............................................................
// All Routes
app.use("/demo", (req, res) => res.send("Hello World"));
app.use("/auth", googleAuthRoute);  // /auth/google GET request
// --

app.use("/api/user", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/campaign", mbbsRoutes);
app.use("/api/ourStudents", ourStudentsRoutes);
app.use("/api/enquiry", EnquiryRoutes);
app.use(
  "/api/admin",
  isAuthenticatedUser,
  authorizedRole(["admin"]),
  AdminRoutes
);

// ///////////////////////////////

// server.listen(port, () => console.log(`🚀 Server running on port: ${port}`));
app.listen(port, () => console.log(`🚀 Server running on port: ${port}`));

connectToDb().catch((err) => {
  console.error("⚠️ Database connection failed:", err.message);
});

// .................................................................

// Handle Uncaught Errors (Optional but Recommended)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

export default app;
