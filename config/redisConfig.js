import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  reconnectOnError: () => true,
  retryStrategy: (times) => {
    if (times > 20) { // After 20 retries, give up
      return null;
    }
    const delay = Math.min(times * 100, 5000); // Start with 100ms, max 5s 
    console.log(`♻️ Redis reconnecting in ${delay}ms`);
    return delay;
  },
  // maxRetriesPerRequest: 1,
  maxRetriesPerRequest: null,

});

let _isRedisConnected = false;

redis.on("connect", () => {
  console.log("🔌 Redis client connecting...");
});

redis.on("ready", () => {
  console.log("✅ Redis client is ready");
  _isRedisConnected = true;
});

redis.on("error", (err) => {
  if (_isRedisConnected) {
    console.error("❌ Redis error:", err.message);
  }
  _isRedisConnected = false;
});

redis.on("end", () => {
  console.log("🛑 Redis connection closed");
  _isRedisConnected = false;
});

const checkRedisHealth = async () => {
  if (!_isRedisConnected) return false;

  try {
    await redis.ping();
    _isRedisConnected = true;
    return true;
  } catch (err) {
    _isRedisConnected = false;
    return false;
  }
};

const isRedisConnected = () => _isRedisConnected;

process.on("SIGINT", async () => {
  await redis.quit();
  process.exit();
});

export { redis, isRedisConnected, checkRedisHealth };
