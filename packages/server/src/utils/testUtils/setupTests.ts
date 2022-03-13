import { AddressInfo } from "net";

import { startServer } from "../../startServer";

module.exports = async () => {
    if (!process.env.TEST_HOST) {
        const server = await startServer();
        const { port } = server.expressServer.address() as AddressInfo;

        process.env.TEST_HOST = `http://localhost:${port}/graphql`;
        process.env.TEST_HOST_ROOT = `http://localhost:${port}`;
    }
};
