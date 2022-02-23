"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const node_1 = require("@graphql-yoga/node");
const server = (0, node_1.createServer)({
    schema: {
        typeDefs: `
            type Query {
                ping: String
            }
        `,
        resolvers: {
            Query: {
                ping: () => "pong"
            }
        }
    },
    logging: {
        prettyLog: true
    }
});
server.start();
//# sourceMappingURL=index.js.map