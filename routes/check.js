import express from "express";
import {isAuthenticatedUser } from "../middleware/auth.js";
import {checkRedisHealth } from "../config/redisConfig.js";
import {getCache, removeCache, setCache} from "../utils/redisCache.js";
import axios from "axios";
 
 
 
const route = express.Router();

 
route.get("/demo", isAuthenticatedUser, (req, res) => {
   console.log("hello World");
   const userId = req.user._id.toString();
   const role = req.user.role || "user";
   console.log("userid & role", userId, role);
 
   res.json({ msg: "Hello World", userId, role });
 });


 route.get("/health", (req, res) => {
  console.log("health Status", { status: "ok", worker: process.pid });
  res.json({ status: "ok", worker: process.pid });
});

route.get("/workers", (req, res) => {
  console.log(`Worker ${process.pid} received a /workers request`);
  res.json({ message: `Worker ${process.pid} is handling requests` });
});

route.get("/redis-health", async (req, res) => {

  console.log(`Redis-Health-Api => Handled by PID: ${process.pid}`);

  const redisHealth = await checkRedisHealth();
  res.json({
    status: "OK",
    redis: redisHealth ? "connected" : "disconnected",
  });
});
route.get("/getData", async (req, res) => {

  console.log(`Handled by PID: ${process.pid}`);

  const redisKey = "posts";

  try {
    const cachedData = await getCache(redisKey);
    if (cachedData) {
      console.log("✅ Served from Redis");
      return res.json({
        success: true,
        processby : process.pid,
        total: cachedData.length,
        // data: cachedData,
        source: "redis"
      });
    }

    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    const data = response.data;
     // Cache the data (fire and forget, don't await)
     setCache (redisKey, data, 30)
     .then(success => {
       if (success) console.log("🌐 Data cached successfully");
     })
     .catch(() => {}); // Silently fail
   
// 
    console.log("🌐 Served from API (database).");
    // return res.json({ success: true, total: data.length, data , source: "api" });
    return res.json({ success: true,  processby : process.pid,total: data.length, source: "api" });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});
route.delete("/remove-redis", async (req, res) => {
  let redisKey= req.body.rediskey
  const cachedData = await getCache(redisKey);

  if (cachedData) {
  removeCache(redisKey)
  console.log(`Redis-Data Removed => Handled by PID: ${process.pid}`);

  }
  return res.status(200).json({
    success: true,
    message: `${redisKey} deleted`,
     
  });
});


route.get("/testLoadBalancing", (req, res) => {
  const workerInfo = {
    pid: process.pid,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  res.json({
    success: true,
    message: `Handled by worker ${process.pid}`,
    // workerInfo
  });
});
export default route;


// # Make 10 quick requests (Linux/MacOS)
// for i in {1..10}; do curl http://localhost:8000/check/testLoadBalancing; echo; done

// for i in {1..10}; do curl http://localhost:8000/check/getData; echo; done



// # Windows alternative
// for /l %i in (1,1,10) do curl http://localhost:8000/testLoadBalancing