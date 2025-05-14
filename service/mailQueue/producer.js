import { Queue } from "bullmq";
// import { redis } from "../../config/redisConfig.js";
import { bullRedis } from "../../config/bullRedisConfig.js";


const emailQueue = new Queue("email-Queue",{connection:bullRedis})

export const queueEmail = async (to, data, emailType) => {
    await emailQueue.add("send-email", { to, data, emailType }, {
      removeOnComplete: true,
      attempts: 3, // retry on failure
    });
 };