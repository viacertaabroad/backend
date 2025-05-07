import Redis from "ioredis";

// Base configuration
const baseRedisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  enableOfflineQueue: true,
};

// Standard Redis Client (for normal cache operations)
const redis = new Redis({
  ...baseRedisConfig,
  db: 0,
  retryStrategy: (times) => {
    if (times > 20) {
      console.log("🛑 Standard Redis: Max reconnection attempts reached");
      return null;
    }
    const delay = Math.min(times * 100, 5000);
    console.log(`♻️ Standard Redis: Reconnecting in ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// Bull Redis Client (with more lenient retry behavior)
const bullRedis = new Redis({
  ...baseRedisConfig,
  db: 1, // Recommended to use separate DB for Bull
  reconnectOnError: (err) => {
    const shouldReconnect = !err.message.includes("READONLY");
    console.log(`♻️ Bull Redis: ${shouldReconnect ? 'Will' : 'Will not'} reconnect after error: ${err.message}`);
    return shouldReconnect;
  },
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 5000);
    if (times % 5 === 1) { // Only log every 5th attempt to reduce noise
      console.log(`♻️ Bull Redis: Attempt ${times}, reconnecting in ${delay}ms`);
    }
    return delay;
  },
  maxRetriesPerRequest: null,
});

// Connection status tracking
const connectionStatus = {
  standard: false,
  bull: false
};

// Standard Redis event listeners
redis.on("connect", () => {
  console.log("🔌 Standard Redis: Connecting...");
  connectionStatus.standard = false;
});

redis.on("ready", () => {
  console.log("✅ Standard Redis: Ready");
  connectionStatus.standard = true;
});

redis.on("error", (err) => {
  if (connectionStatus.standard) {
    console.error("❌ Standard Redis error:", err.message);
  }
  connectionStatus.standard = false;
});

redis.on("end", () => {
  console.log("🛑 Standard Redis: Connection closed");
  connectionStatus.standard = false;
});

// Bull Redis event listeners
bullRedis.on("connect", () => {
  console.log("🔌 Bull Redis: Connecting...");
  connectionStatus.bull = false;
});

bullRedis.on("ready", () => {
  console.log("✅ Bull Redis: Ready (Queue operations enabled)");
  connectionStatus.bull = true;
});

bullRedis.on("error", (err) => {
  if (connectionStatus.bull) {
    console.error("❌ Bull Redis error:", err.message);
  }
  connectionStatus.bull = false;
});

bullRedis.on("end", () => {
  console.log("🛑 Bull Redis: Connection closed");
  connectionStatus.bull = false;
});

// Health checks
const checkRedisHealth = async () => {
  try {
    await redis.ping();
    connectionStatus.standard = true;
    return {
      standard: true,
      bull: connectionStatus.bull
    };
  } catch (err) {
    connectionStatus.standard = false;
    return {
      standard: false,
      bull: connectionStatus.bull
    };
  }
};

const checkBullRedisHealth = async () => {
  try {
    await bullRedis.ping();
    connectionStatus.bull = true;
    return true;
  } catch (err) {
    connectionStatus.bull = false;
    return false;
  }
};

// Graceful shutdown
const shutdownRedis = async () => {
  try {
    await Promise.all([
      redis.quit(),
      bullRedis.quit()
    ]);
    console.log("🛑 Both Redis clients disconnected gracefully");
  } catch (err) {
    console.error("Error disconnecting Redis:", err);
  }
};

process.on("SIGTERM", shutdownRedis);
process.on("SIGINT", shutdownRedis);

export {
  redis,
  bullRedis,
  checkRedisHealth,
  checkBullRedisHealth,
  connectionStatus,
  shutdownRedis
};