import { request } from "graphql-request";

import { User } from "../../entities/User";
import { startServer } from "../../startServer";
import { getConnection } from "typeorm";

const email = "tom@gmail.com";
const password = "tom123";

const registerMutation = `
    mutation {
        register(email: "${email}", password: "${password}") {
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
        const response = await request(host, registerMutation);
        expect(response).toEqual({ register: null });
    });

    it("Should return 1 user", async () => {
        const users = await User.find({ where: { email } });
        expect(users).toHaveLength(1);
    });

    it("Should return user with different password (because it is hashed)", async () => {
        const users = await User.find({ where: { email } });
        const user = await users[0];
        expect(user.email).toEqual(email);
        expect(user.password).not.toEqual(password);
    });

    it("Should return error if an email is already taken", async () => {
        const response = await request(host, registerMutation);
        expect(response.register).toHaveLength(1);
        expect(response.register[0].path).toEqual("email");
    });
});
