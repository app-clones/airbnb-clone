import { request } from "graphql-request";
import { Connection } from "typeorm";

import { User } from "../entities/User";
import { host } from "./constants";
import { createTypeormConnection } from "../utils/createTypeormConnection";

const email = "tom@gmail.com";
const password = "tom123";

const registerMutation = `
    mutation {
        register(email: "${email}", password: "${password}")
    }
`;

let connection: Connection;

beforeAll(async () => {
    connection = await createTypeormConnection();
});

afterAll(() => {
    connection.close();
});

test("Register user", async () => {
    const response = await request(host, registerMutation);
    expect(response).toEqual({ register: true });

    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);

    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
});
