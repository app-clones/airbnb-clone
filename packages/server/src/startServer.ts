import * as path from "path";
import * as express from "express";

import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { createServer } from "@graphql-yoga/node";

import * as session from "express-session";

import * as connectRedis from "connect-redis";
import * as cors from "cors";

import dataSource from "./utils/dataSource";

import { mergeSchemas } from "@graphql-tools/schema";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

import { MyContext } from "./types/types";

import { confirmEmail } from "./routes/confirmEmail";

import { redis } from "./utils/redis";

const RedisStore = connectRedis(session);

export const startServer = async () => {
    const resolvers = loadFilesSync(
        path.join(__dirname, "./modules/**/*.resolver.ts"),
        {
            extensions: ["ts"]
        }
    );

    const typeDefs = await loadSchema(path.join(__dirname, "./**/*.graphql"), {
        loaders: [new GraphQLFileLoader()]
    });

    const app = express();
    const PORT = process.env.NODE_ENV === "test" ? 3000 : 4000;

    app.use(
        session({
            store: new RedisStore({
                client: redis
            }),
            name: "qid",
            secret: process.env.SESSION_SECRET!,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            }
        })
    );

    app.use(
        cors({
            credentials: true,
            origin: "http://localhost:3000"
        })
    );

    // @ts-ignore
    app.get("/confirm/:id", confirmEmail);

    let yogaSession: any;

    app.get("/bug-fix-ignore", (req, res) => {
        yogaSession = req.session;
        return res.status(200).json({ msg: "Fixed" });
    });

    const expressServer = app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/graphql`);
    });

    try {
        await fetch(`http://localhost:${PORT}/bug-fix-ignore`);
    } catch (e) {
        console.error(e);
    }

    const server = createServer<MyContext>({
        schema: mergeSchemas({
            typeDefs: mergeTypeDefs(typeDefs),
            resolvers: mergeResolvers(resolvers)
        }),
        logging: true,
        maskedErrors: false,
        port: process.env.NODE_ENV === "test" ? 3000 : 4000,
        context: ({ request }) => ({
            request,
            redis,
            url: "http://" + request.headers.get("host"),
            session: yogaSession
        })
    });

    app.use("/graphql", server);

    await dataSource.initialize();

    return { server, expressServer, redis };
};
