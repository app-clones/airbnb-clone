import { Redis } from "ioredis";
import { v4 as uuid } from "uuid";

export const createConfirmEmailLink = async (
    url: string,
    userId: string,
    redis: Redis
) => {
    const id = uuid();
    await redis.set(id, userId);
    await redis.expire(id, 60 * 60 * 24); // 24 hours
    return `${url}/confirm/${id}`;
};
