import Redis from "ioredis";
import axios from "axios";
import { faker } from "@faker-js/faker";

import { User } from "../entities/User";
import { createConfirmEmailLink } from "../utils/createConfirmEmailLink";
import dataSource from "../utils/dataSource";
import { DataSource } from "typeorm";

let userId: string;
const redis = new Redis();

let conn: DataSource;

beforeAll(async () => {
    conn = await dataSource.initialize();
    const user = await User.create({
        email: faker.internet.email(),
        password: faker.internet.password()
    }).save();

    userId = user.id;
});

afterAll(async () => {
    await conn.destroy();
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
