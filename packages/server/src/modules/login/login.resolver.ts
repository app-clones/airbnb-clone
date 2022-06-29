import * as argon2 from "argon2";

import { User } from "../../entities/User";

import { MutationLoginArgs, Resolvers } from "../../types/graphql";
import { MyContext } from "../../types/types";

import { CONFIRM_EMAIL, INVALID_LOGIN } from "./errorMessages";

const invalidLoginResponse = [{ path: "email", message: INVALID_LOGIN }];

export const resolvers: Resolvers<MyContext> = {
    Mutation: {
        login: async (
            _,
            { email, password }: MutationLoginArgs,
            { session }
        ) => {
            const user = await User.findOne({ where: { email } });

            if (!user) return invalidLoginResponse;

            if (!user.confirmed)
                return [{ path: "email", message: CONFIRM_EMAIL }];

            const validPassword = await argon2.verify(user.password, password);

            if (!validPassword) return invalidLoginResponse;

            console.log(session);

            session.userId = user.id;

            return null;
        }
    }
};
