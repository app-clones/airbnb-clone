import * as path from "path";

import { createServer } from "@graphql-yoga/node";
import { mergeSchemas } from "@graphql-tools/schema";

import { createTypeormConnection } from "./utils/createTypeormConnection";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

export const startServer = async () => {
    const resolvers = loadFilesSync(path.join(__dirname, "./modules"), {
        extensions: ["ts"]
    });

    const typeDefs = loadFilesSync(path.join(__dirname, "./modules"), {
        extensions: ["graphql"]
    });

    const server = createServer({
        schema: mergeSchemas({
            typeDefs: mergeTypeDefs(typeDefs),
            resolvers: mergeResolvers(resolvers)
        }),
        logging: {
            prettyLog: true
        },
        maskedErrors: false,
        port: process.env.NODE_ENV === "test" ? 3000 : 4000
    });

    await createTypeormConnection();
    await server.start();

    return server;
};
