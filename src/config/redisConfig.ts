import MessageBrokerOptions from "../interfaces/MessageBrokerOptions";

const redisConfig: MessageBrokerOptions = {
    host: process.env.REDIS_HOST ? process.env.REDIS_HOST : "192.168.99.100", // Redis host
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379, // Redis port
    family: 4, // 4 (IPv4) or 6 (IPv6)
};

export default redisConfig;