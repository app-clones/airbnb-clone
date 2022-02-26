import { hash } from "argon2";

import { User } from "../../entities/User";

import { MutationRegisterArgs, Resolvers } from "../../types/graphql";

export const resolvers: Resolvers = {
    Query: {
        hello: (_) => "annoying bug"
    },
    Mutation: {
        register: async (_, { email, password }: MutationRegisterArgs) => {
            const userAlreadyExists = await User.findOne({
                where: { email },
                select: ["id"]
            });
            if (userAlreadyExists) {
                return [
                    {
                        path: "email",
                        message: "Already taken"
                    }
                ];
            }

            const hashedPassword = await hash(password, {
                hashLength: 128,
                timeCost: 5
            });

            const user = User.create({ email, password: hashedPassword });
            await user.save();

            return null;
        }
    }
};
