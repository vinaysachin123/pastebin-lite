import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: any = null;

if (url && token) {
	redis = Redis.fromEnv();
} else {
	console.warn(
		"[Redis] UPSTASH env vars missing — Redis client not initialized (local fallback)"
	);
}

export default redis;
