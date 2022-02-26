import * as path from "path";

import { createServer } from "@graphql-yoga/node";
import { mergeSchemas } from "@graphql-tools/schema";

import { createTypeormConnection } from "./utils/createTypeormConnection";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

export const startServer = async () => {
    const resolvers = loadFilesSync(path.join(__dirname, "./modules"), {
        extensions: ["ts"]
    });

    const typeDefs = await loadSchema(path.join(__dirname, "./**/*.graphql"), {
        loaders: [new GraphQLFileLoader()]
    });

    const server = createServer({
        schema: mergeSchemas({
            typeDefs: mergeTypeDefs(typeDefs),
            resolvers: mergeResolvers(resolvers)
        }),
        logging: {
            prettyLog: true,
            logLevel: "info"
        },
        maskedErrors: false,
        port: process.env.NODE_ENV === "test" ? 3000 : 4000
    });

    await createTypeormConnection();
    await server.start();

    return server;
};
