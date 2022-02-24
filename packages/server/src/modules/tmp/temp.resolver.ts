import { ResolverMap } from "../../types/graphqlUtils";

export const resolvers: ResolverMap = {
    Query: {
        ping: (_) => "Pong!"
    }
};
