import { hash } from "argon2";
import * as yup from "yup";

import { User } from "../../entities/User";
import { MutationRegisterArgs, Resolvers } from "../../types/graphql";
import { formatYupError } from "../../utils/formatYupError";
import {
    duplicateEmail,
    emailNotLongEnough,
    invalidEmail,
    passwordNotLongEnough
} from "./errorMessages";

const schema = yup.object().shape({
    email: yup
        .string()
        .min(3, emailNotLongEnough)
        .max(255)
        .email(invalidEmail)
        .required(),
    password: yup.string().min(3, passwordNotLongEnough).max(255).required()
});

export const resolvers: Resolvers = {
    Mutation: {
        register: async (_, args: MutationRegisterArgs) => {
            try {
                await schema.validate(args, { abortEarly: false });
            } catch (err) {
                return formatYupError(err);
            }

            const { email, password } = args;
            const userAlreadyExists = await User.findOne({
                where: { email },
                select: ["id"]
            });

            if (userAlreadyExists) {
                return [
                    {
                        path: "email",
                        message: duplicateEmail
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
