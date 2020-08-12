import {RedisOptions} from "ioredis";
import FunctionMessage from "./FunctionMessage";
import Message from "./Message";

export default interface MessageBrokerOptions extends RedisOptions {
    echo?: FunctionMessage<Message>
}