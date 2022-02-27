import * as path from "path";
import * as Redis from "ioredis";
import * as express from "express";

import { createServer } from "@graphql-yoga/node";
import { mergeSchemas } from "@graphql-tools/schema";

import { createTypeormConnection } from "./utils/createTypeormConnection";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

import { MyContext } from "./types/types";
import { User } from "./entities/User";

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

    const redis = new Redis();
    const app = express();
    const PORT = process.env.NODE_ENV === "test" ? 3000 : 4000;

    const server = createServer<MyContext, unknown>({
        schema: mergeSchemas({
            typeDefs: mergeTypeDefs(typeDefs),
            resolvers: mergeResolvers(resolvers)
        }),
        logging: {
            prettyLog: true,
            logLevel: "info"
        },
        maskedErrors: false,
        port: process.env.NODE_ENV === "test" ? 3000 : 4000,
        context: ({ request }) => ({
            redis,
            url: "//" + request.headers.get("host"),
            request
        })
    });

    app.use("/graphql", server.requestListener);

    app.get("/confirm/:id", async (req, res) => {
        const { id } = req.params;
        const userId = await redis.get(id);

        if (userId) {
            await User.update({ id: userId }, { confirmed: true });
            res.send("ok");
        } else {
            res.send("invalid");
        }
    });

    await createTypeormConnection();
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/graphql`);
    });

    return server;
};
