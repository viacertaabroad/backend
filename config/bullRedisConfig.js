import Redis from "ioredis";

// Bull Redis Client with more lenient retry behavior
export const bullRedis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
    reconnectOnError: () => true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 5000); // Allow retries for job processing
      return delay;
    },
    maxRetriesPerRequest: null, // Allow unlimited retries for job processing
  });
 
 