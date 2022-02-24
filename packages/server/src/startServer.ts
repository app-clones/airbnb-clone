import { createServer } from "@graphql-yoga/node";
import { join } from "path";

import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";

import { resolvers } from "./resolvers";
import { createTypeormConnection } from "./utils/createTypeormConnection";

export const startServer = async () => {
    const typeDefs = loadSchemaSync(join(__dirname, "schema.graphql"), {
        loaders: [new GraphQLFileLoader()]
    });

    const schema = addResolversToSchema({ schema: typeDefs, resolvers });

    const server = createServer({
        schema,
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
