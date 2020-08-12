import MessageBroker from "./MessageBroker";
import Message from "../interfaces/Message";
import FunctionMessage from "../interfaces/FunctionMessage";
import MessageBrokerOptions from "../interfaces/MessageBrokerOptions";

import {getCurrentUnixTimeGMT} from "../utils";
import * as IORedis from "ioredis";


export default class Redis extends MessageBroker {
    private _instance: any;
    private _subscriber: any;
    private echo: FunctionMessage<Message> = async (message) => {
        console.log(message, '---');
    };
    private config: IORedis.RedisOptions;

    constructor(config: IORedis.RedisOptions) {
        super();
        this.setConfig(config);
    }

    public async init(config?: IORedis.RedisOptions) {
        if (config) this.setConfig(config);
        this._instance = await new IORedis(this.config);
        await new Promise((resolve, reject) => {
            try {
                this._instance.on("ready", () => {
                    console.log(`Redis client connection has been initialized`);
                    resolve();
                });
            } catch (err) {
                reject(err)
            }
        })
    }

    private async initSubscriber(config?: IORedis.RedisOptions) {
        if (config) this.setConfig(config);
        this._subscriber = await new IORedis(this.config);
        await new Promise((resolve, reject) => {
            try {
                this._subscriber.on("ready", () => {
                    console.log(`Redis subscriber connection has been initialized`);
                    resolve();
                });
            } catch (err) {
                reject(err)
            }
        })
        await this._subscriber.config("SET", "notify-keyspace-events", "Ex");
    }

    public async publish(message: Message) {
        const time = new Date(message.time).getTime();
        const now =  getCurrentUnixTimeGMT();
        const timeToExpiration = parseInt(`${(time - now) / 1000}` ,0);
        await this._instance.multi()
            .set(time, JSON.stringify(message))
            .set(`reminder:${time}`, 1)
            .expire(`reminder:${time}`, timeToExpiration)
            .exec();

        if (process.env.DEBUG)
            console.info(`${time}: ${JSON.stringify(message)} was added to queue`)
    }


    public async subscribe(handler?: FunctionMessage<Message>) {
        let _this = this;
        await _this.initSubscriber();
        if (handler)
            _this.setEchoHandler(handler);
        await _this._subscriber.psubscribe('__keyevent@0__:expired', 1);
        await _this._subscriber.on("pmessage", async (pattern, channel, message) => {
            const [type, key] = message.split(":");
            switch (type) {
                case "reminder": {
                    const value = await _this._instance.get(key);
                    _this.echo(value);
                    break;
                }
            }
        });
    }

    private setEchoHandler(handler: FunctionMessage<Message>) {
        this.echo = handler;
    }

    private async setConfig(config: MessageBrokerOptions) {
        if (config.echo) {
            this.setEchoHandler(config.echo);
            delete config.echo;
        }
        this.config = config;
    }
}