import { hash } from "argon2";

import { User } from "../../entities/User";
import { ResolverMap } from "../../types/graphqlUtils";

export const resolvers: ResolverMap = {
    Query: {
        hello: (_) => "annoying bug"
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
