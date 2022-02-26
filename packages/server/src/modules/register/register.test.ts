import { request } from "graphql-request";
import { getConnection } from "typeorm";

import { User } from "../../entities/User";
import { startServer } from "../../startServer";
import {
    duplicateEmail,
    emailNotLongEnough,
    invalidEmail,
    passwordNotLongEnough
} from "./errorMessages";

const email = "tom@gmail.com";
const password = "tom123";

const registerMutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

let host = "";
let server: any;

beforeAll(async () => {
    server = await startServer();
    const { port } = server.getAddressInfo();
    host = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
    await server.stop();
    await getConnection().close();
});

describe("Register user", () => {
    it("Should return a response equal to null", async () => {
        const response = await request(host, registerMutation(email, password));
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
        const response = await request(host, registerMutation(email, password));

        expect(response.register[0]).toEqual({
            path: "email",
            message: duplicateEmail
        });
    });

    it('Should return an "invalid email" error', async () => {
        const response = await request(host, registerMutation("a", password));

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
        const response = await request(host, registerMutation(email, "a"));

        expect(response.register[0]).toEqual({
            path: "password",
            message: passwordNotLongEnough
        });
    });

    it("Should return several errors", async () => {
        const response = await request(host, registerMutation("a", "a"));

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
