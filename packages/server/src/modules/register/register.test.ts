import { request } from "graphql-request";
import { DataSource } from "typeorm";
import { faker } from "@faker-js/faker";

import { User } from "../../entities/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import {
    duplicateEmail,
    emailNotLongEnough,
    invalidEmail,
    passwordNotLongEnough
} from "./errorMessages";

const email = faker.internet.email();
const password = faker.internet.password();

const registerMutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

let conn: DataSource;

beforeAll(async () => {
    conn = await createTypeormConnection();
});

afterAll(async () => {
    await conn.close();
});

describe("Register user", () => {
    it("Should return a response equal to null", async () => {
        const response = await request(
            process.env.TEST_HOST!,
            registerMutation(email, password)
        );
        expect(response).toEqual({ register: null });
    });

    it("Should return 1 user", async () => {
        const users = await User.find({ where: { email } });
        expect(users).toHaveLength(1);
    });

    it("Should return a user with a different password (because it is hashed)", async () => {
        const users = await User.find({ where: { email } });
        const user = users[0];

        expect(user.email).toEqual(email);
        expect(user.password).not.toEqual(password);
    });

    it("Should return error if an email is already taken", async () => {
        const response = await request(
            process.env.TEST_HOST!,
            registerMutation(email, password)
        );

        expect(response.register[0]).toEqual({
            path: "email",
            message: duplicateEmail
        });
    });

    it('Should return an "invalid email" error', async () => {
        const response = await request(
            process.env.TEST_HOST!,
            registerMutation("a", password)
        );

        expect(response.register).toEqual([
            {
                path: "email",
                message: emailNotLongEnough
            },
            {
                path: "email",
                message: invalidEmail
            }
        ]);
    });

    it('Should return a "password too short" error', async () => {
        const response = await request(
            process.env.TEST_HOST!,
            registerMutation(email, "a")
        );

        expect(response.register[0]).toEqual({
            path: "password",
            message: passwordNotLongEnough
        });
    });

    it("Should return several errors", async () => {
        const response = await request(
            process.env.TEST_HOST!,
            registerMutation("a", "a")
        );

        expect(response.register).toEqual([
            {
                path: "email",
                message: emailNotLongEnough
            },
            {
                path: "email",
                message: invalidEmail
            },
            {
                path: "password",
                message: passwordNotLongEnough
            }
        ]);
    });
});
