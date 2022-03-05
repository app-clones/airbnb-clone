import * as Redis from "ioredis";
import axios from "axios";
import faker from "@faker-js/faker";

import { getConnection } from "typeorm";

import { User } from "../entities/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConnection } from "./createTypeormConnection";

let userId: string;
const redis = new Redis();

beforeAll(async () => {
    await createTypeormConnection();
    const user = await User.create({
        email: faker.internet.email(),
        password: faker.internet.password()
    }).save();

    userId = user.id;
});

afterAll(async () => {
    await getConnection().close();
});

describe("Create Confirm Email Link", () => {
    it("Confirms user and clears key in redis", async () => {
        const url = await createConfirmEmailLink(
            process.env.TEST_HOST_ROOT!, // No /graphql at the end of the URL
            userId,
            new Redis()
        );

        const res = await axios.get(url);
        const text = res?.data;
        expect(text).toEqual("ok");

        const user = await User.findOne({ where: { id: userId } });

        expect(user?.confirmed).toBeTruthy();

        const chunks = url.split("/");
        const key = chunks[chunks.length - 1];
        const value = await redis.get(key);
        expect(value).toBeNull();
    });

    it("Sends back invalid if a bad id was sent", async () => {
        const res = await axios.get(
            `${process.env.TEST_HOST_ROOT}/confirm/230918709431`
        );
        const text = res?.data;

        expect(text).toEqual("invalid");
    });
});
