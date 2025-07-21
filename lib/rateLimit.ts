import redis from "./redis";

export async function rateLimitOncePerDay(ip: string) {
  const key = `ratelimit:daily:${ip}`;
  const oneDaySeconds = 60 * 60 * 24;

  const wasSet = await redis.set(key, Date.now(), {
    nx: true,
    ex: oneDaySeconds,
  });

  if (wasSet === null) {
    return { allowed: false };
  } else {
    return { allowed: true };
  }
}
