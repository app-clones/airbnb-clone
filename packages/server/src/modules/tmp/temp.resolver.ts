import { Resolvers } from "../../types/graphql";

export const resolvers: Resolvers = {
    Query: {
        ping: (_) => "Pong!"
    }
};
