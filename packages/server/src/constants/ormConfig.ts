export const devOptions = {
    name: "development",
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "beatzoid",
    password: "beatzoid",
    database: "airbnb",
    synchronize: true,
    logging: true,
    entities: ["entities/**/*.ts"],
    migrations: ["migrations/**/*.ts"],
    subscribers: ["subscribers/**/*.ts"],
    cli: {
        entitiesDir: "entities",
        migrationsDir: "migrations",
        subscribersDir: "subscribers"
    }
};

export const testOptions = {
    name: "test",
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "beatzoid",
    password: "beatzoid",
    database: "airbnb-test",
    synchronize: true,
    logging: false,
    entities: ["entities/**/*.ts"],
    migrations: ["migrations/**/*.ts"],
    subscribers: ["subscribers/**/*.ts"],
    cli: {
        entitiesDir: "entities",
        migrationsDir: "migrations",
        subscribersDir: "subscribers"
    }
};
