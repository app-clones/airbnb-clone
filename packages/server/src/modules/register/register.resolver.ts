import { hash } from "argon2";
import * as yup from "yup";

import { User } from "../../entities/User";

import { MutationRegisterArgs, Resolvers } from "../../types/graphql";
import { MyContext } from "../../types/types";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";

import { formatYupError } from "../../utils/formatYupError";
import { sendEmail } from "../../utils/sendEmail";
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
        register: async (
            _,
            args: MutationRegisterArgs,
            { redis, url }: MyContext
        ) => {
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

            const confirmUrl = await createConfirmEmailLink(
                url,
                user.id,
                redis
            );

            if (process.env.NODE_ENV !== "test")
                await sendEmail(
                    email,
                    "Confirm AirBNB Email",
                    "",
                    `
                <html>
                    <body>
                        Click <a href="${confirmUrl}">here</a> to confirm your email for AirBNB
                    </body>
                </html>`
                );

            return null;
        }
    }
};
