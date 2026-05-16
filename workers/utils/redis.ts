import Redis from "ioredis";

// Shared Redis connection instance
export const createRedisConnection = (url: string) => {
  return new Redis(url, {
    maxRetriesPerRequest: null,
    tls: {},
  });
};

export const getRedisConnection = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is required");
  }
  return createRedisConnection(process.env.REDIS_URL);
};
