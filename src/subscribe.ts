import Redis from "./service/Redis";
import redisConfig from "./config/redisConfig";

(async () => {
    const mq = new Redis(redisConfig);
    await mq.init();
    await mq.subscribe( async <FunctionMessage>(message) => {
        try {
            const {time, body} = JSON.parse(message);
            console.log(`${time}: ${body}`)
        }catch(err){
            console.error("Message parse error",err);
        }
    })
})()