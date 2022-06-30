import { faker } from "@faker-js/faker";
import { request } from "graphql-request";
import { DataSource } from "typeorm";

import { CONFIRM_EMAIL, INVALID_LOGIN } from "./errorMessages";

import { User } from "../../entities/User";

import dataSource from "../../utils/dataSource";

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

const loginMutation = (e: string, p: string) => `
    mutation {
        login(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

let conn: DataSource;

beforeAll(async () => {
    conn = await dataSource.initialize();
});

afterAll(async () => {
    await conn.destroy();
});

const expectLoginError = async (e: string, p: string, errorMsg: string) => {
    const loginRes = await request(process.env.TEST_HOST!, loginMutation(e, p));

    expect(loginRes).toEqual({
        login: [{ path: "email", message: errorMsg }]
    });
};

describe("Login", () => {
    test("Returns correct error for a bad email", async () => {
        await expectLoginError("bob@bob.com", "password", INVALID_LOGIN);
    });

    test("Returns correct errors and successfully logs in", async () => {
        await request(
            process.env.TEST_HOST!,
            registerMutation(email, password)
        );

        // Unconfirmed email
        await expectLoginError(email, password, CONFIRM_EMAIL);

        await User.update({ email }, { confirmed: true });

        // Wrong password
        await expectLoginError(email, "wrong", INVALID_LOGIN);

        const loginRes = await request(
            process.env.TEST_HOST!,
            loginMutation(email, password)
        );

        expect(loginRes).toEqual({ login: null });
    });
});
