import { DataSource } from "typeorm";
import * as path from "path";

import { devOptions, testOptions } from "../constants/ormConfig";

const dataSource = new DataSource(
    process.env.NODE_ENV === "development"
        ? {
              ...devOptions,
              type: "postgres",
              entities: [path.join(__dirname, "..", "entities/**/*.ts")],
              migrations: [path.join(__dirname, "..", "migrations/**/*.ts")],
              subscribers: [path.join(__dirname, "..", "subscribers/**/*.ts")]
          }
        : {
              ...testOptions,
              type: "postgres",
              entities: [path.join(__dirname, "..", "entities/**/*.ts")],
              migrations: [path.join(__dirname, "..", "migrations/**/*.ts")],
              subscribers: [path.join(__dirname, "..", "subscribers/**/*.ts")]
          }
);

export default dataSource;
