import Redis from "./service/Redis";
import redisConfig from "./config/redisConfig";

(async () => {
    const mq = new Redis(redisConfig);
    await mq.init();
    await mq.subscribe( async <FunctionMessage>(message) => {
            console.log(message)
    })
})()
