import { hash } from "argon2";

import { User } from "./entity/User";
import { ResolverMap } from "./types/graphqlUtils";

export const resolvers: ResolverMap = {
    Query: {
        hello: (_, { name }: GQL.IHelloOnQueryArguments) => `Hello ${name}!`
    },
    Mutation: {
        register: async (
            _,
            { email, password }: GQL.IRegisterOnMutationArguments
        ) => {
            const hashedPassword = await hash(password, {
                hashLength: 128,
                timeCost: 5
            });

            const user = User.create({ email, password: hashedPassword });
            await user.save();

            return true;
        }
    }
};
