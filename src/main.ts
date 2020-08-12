import {Server} from './api/Server';

(async () => {
    const server = new Server({port: 3000});
    await server.start()
})()