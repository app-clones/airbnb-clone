import { AddressInfo } from "net";

import { startServer } from "../../startServer";

module.exports = async () => {
    const server = await startServer();
    const { port } = server.expressServer.address() as AddressInfo;

    process.env.TEST_HOST = `http://localhost:${port}/graphql`;
};
