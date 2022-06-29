import { YogaInitialContext } from "@graphql-yoga/node";
import { Session } from "express-session";
import { Redis } from "ioredis";

export interface MyContext extends YogaInitialContext {
    redis: Redis;
    url: string;
    session: Session & { userId: string };
}

declare module "express" {
    export interface Request {
        session: Session & { userId: string };
    }
}
