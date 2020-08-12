import {createServer, IncomingMessage, ServerResponse} from 'http';
import Redis from "../service/Redis";
import Message from "../interfaces/Message";
import {getCurrentUnixTimeGMT} from "../utils";
import redisConfig from "../config/redisConfig";

export class Server {
    private port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    private server;
    private mq: any;

    constructor({port}) {
        this.port = port;
    }

    private async listen() {
        this.mq = new Redis(redisConfig);
        await this.mq.init();
        await this.server.listen(this.port);
        if (process.env.DEBUG)
            console.info(`HTTP server is listening on ${this.port} port`);
    }

    public async start() {
        if (this.server) return this.server;
        this.server = await createServer(this.processRequest.bind(this));
        await this.listen();
        return this.server;
    }

    private async processRequest(request: IncomingMessage, response: ServerResponse) {
        const url = request.url.split('?')[0];
        switch (url.toLowerCase()) {
            case '/echoattime': {
                if (request.method === 'POST') {
                    response.setHeader('Content-Type', 'application/json');
                    const message = await this.getJSONDataFromRequestStream<Message>(request)
                        .catch(err => {
                            console.error(`${err}`);
                            this.badRequest(response)
                        })
                    if (!message || !this.validateMessage(message)) return this.badRequest(response);
                    await this.mq.publish(message);
                    response.statusCode = 201;
                    response.end(JSON.stringify({result: "Message was placed into the queue"}));
                    break;
                }
            }
            default: {
                if (process.env.DEBUG)
                    console.info(`HTTP 404: ${url}`);
                response.statusCode = 404;
                response.end();
            }
        }
    }

    private badRequest(response): void {
        response.statusCode = 400;
        response.end(JSON.stringify({"error": "Bad request"}));
    }

    private validateMessage(message: Message): boolean {
        const now = getCurrentUnixTimeGMT();
        try {
            if (!message.body.length) return false;
            const dateTime = new Date(message.time);
            if (!dateTime.getTime()) return false;
            if (dateTime.getTime() < now) return false;
        } catch (err) {
            return false;
        }
        return true;
    }

    private getJSONDataFromRequestStream<T>(request: IncomingMessage): Promise<T> {
        return new Promise((resolve, reject) => {
            const chunks = [];
            request.on('data', (chunk) => {
                chunks.push(chunk);
            });
            request.on('end', () => {
                try {
                    resolve(JSON.parse(Buffer.concat(chunks).toString()))
                } catch (err) {
                    reject(err);
                }
            });
        })
    }
}
