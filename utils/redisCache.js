import { isRedisConnected, redis } from "../config/redisConfig.js";
 
// Get from Redis
const getCache = async (key) => {
  if (!isRedisConnected()) return null;
  
  try {
    const data = await redis .get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
      // Only log unexpected errors (not connection errors)
    if (err.message !== 'Connection is closed.') {
      console.error("❌ Redis GET error:", err.message);
    }
    return null;
  }
};

// Set in Redis with expiry (default 60s)
const setCache = async (key, value, expiry = 60) => {
  if (!isRedisConnected())   {console.warn("Redis not connected. Skipping cache set.");
  return false;
  }
  try {
    if (expiry > 0) {
      await redis.set(key, JSON.stringify(value), "EX", expiry);
    } else {
      await redis.set(key, JSON.stringify(value));
    }
    return true;
  } catch (err) {
    // / Only log unexpected errors (not connection errors)
    if (err.message !== 'Connection is closed.') {
      console.error("❌ Redis SET error:", err.message);
    }
    return false;
  }
};

const removeCache = async (key) => {
  if (!isRedisConnected()) {
    console.warn("Redis not connected. Skipping cache removal.");
    return false;
  }
  
  try {
    const result = await redis.del(key);
    return result > 0; // returns true if key was deleted, false if key didn't exist
  } catch (err) {
    // Only log unexpected errors (not connection errors)
    if (err.message !== 'Connection is closed.') {
      console.error("❌ Redis DEL error:", err.message);
    }
    return false;
  }
};

 export  {
  getCache,
  setCache,
  removeCache
};