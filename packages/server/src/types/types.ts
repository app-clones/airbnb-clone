import { YogaInitialContext } from "@graphql-yoga/node";
import { Redis } from "ioredis";

export interface MyContext extends YogaInitialContext {
    redis: Redis;
    url: string;
}
