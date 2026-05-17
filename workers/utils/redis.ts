import Redis from "ioredis";

// Shared Redis connection instance
export const createRedisConnection = (url: string) => {
  return new Redis(url, {
    maxRetriesPerRequest: null,
    tls: {},
  });
};
