import * as path from "path";
import * as express from "express";

import { createServer } from "@graphql-yoga/node";
import { mergeSchemas } from "@graphql-tools/schema";

import { createTypeormConnection } from "./utils/createTypeormConnection";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

import { MyContext } from "./types/types";

import { confirmEmail } from "./routes/confirmEmail";

import { redis } from "./utils/redis";

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
            url: "http://" + request.headers.get("host"),
            request
        })
    });

    app.use("/graphql", server.requestListener);

    app.get("/confirm/:id", confirmEmail);

    await createTypeormConnection();
    const expressServer = app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/graphql`);
    });

    return { server, expressServer, redis };
};
