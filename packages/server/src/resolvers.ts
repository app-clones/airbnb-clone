/// <reference path="types/schema.d.ts" />

import { ResolverMap } from "./types/graphqlUtils";

export const resolvers: ResolverMap = {
    Query: {
        hello: (_: any, { name }: GQL.IHelloOnQueryArguments) =>
            `Hello ${name}!`
    },
    Mutation: {
        register: (
            _: any,
            { email, password }: GQL.IRegisterOnMutationArguments
        ) => {
            console.log(email, password);
            return true;
        }
    }
};
