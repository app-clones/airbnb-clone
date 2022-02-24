import { request } from "graphql-request";

import { User } from "../../entities/User";
import { startServer } from "../../startServer";
import { getConnection } from "typeorm";

const email = "tom@gmail.com";
const password = "tom123";

const registerMutation = `
    mutation {
        register(email: "${email}", password: "${password}")
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

test("Register user", async () => {
    const response = await request(host, registerMutation);
    expect(response).toEqual({ register: true });

    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);

    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
});
