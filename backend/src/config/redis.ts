import { createClient, type RedisClientType } from 'redis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export let redisClient: RedisClientType | null = null;

export async function connectRedis(): Promise<boolean> {
  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: false,
      },
    });

    redisClient.on('error', (error) => {
      console.warn('Redis connection error:', error instanceof Error ? error.message : String(error));
    });

    await redisClient.connect();
    console.log('Redis connected successfully.');
    return true;
  } catch (error) {
    console.warn(
      'Redis unavailable. Real-time event bus remains disabled for local demo mode.',
      error instanceof Error ? error.message : String(error),
    );
    redisClient = null;
    return false;
  }
}

export async function publishGameEvent(channel: string, payload: unknown): Promise<boolean> {
  if (!redisClient) {
    return false;
  }

  try {
    await redisClient.publish(channel, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('Redis publish failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient) {
    return;
  }

  await redisClient.quit();
  redisClient = null;
}
