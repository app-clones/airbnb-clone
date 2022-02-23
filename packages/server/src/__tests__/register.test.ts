import { request } from "graphql-request";
import { Connection, createConnection } from "typeorm";

import { User } from "../entities/User";
import { host } from "./constants";

const email = "tom@gmail.com";
const password = "tom123";

const registerMutation = `
    mutation {
        register(email: "${email}", password: "${password}")
    }
`;

let connection: Connection;

beforeAll(async () => {
    connection = await createConnection();
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
