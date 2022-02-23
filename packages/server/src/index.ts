import "reflect-metadata";

import { createServer } from "@graphql-yoga/node";
import { join } from "path";

import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";

import { resolvers } from "./resolvers";

const typeDefs = loadSchemaSync(join(__dirname, "schema.graphql"), {
    loaders: [new GraphQLFileLoader()]
});

const schema = addResolversToSchema({ schema: typeDefs, resolvers });

// Provide your schema
const server = createServer({
    schema,
    logging: {
        prettyLog: true
    },
    maskedErrors: false
});

// Start the server and explore http://localhost:4000/graphql
server.start().catch((err) => console.error(err));
