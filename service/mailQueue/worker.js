 
import { Worker } from "bullmq";
import { sendEmail } from "../../utils/sendMail.js";  
// import { redis } from "../../config/redisConfig.js";
import { bullRedis } from "../../config/bullRedisConfig.js";
 
export const emailWorker = new Worker("email-Queue", async (job) => {
    console.log("📩 Message received: ID =", job.id);
    console.log("➡️ Sending email to", job.data.email);
  const { to, data, emailType } = job.data;
  await sendEmail(to, data, emailType);
  console.log("✅ Email sent");
},{connection:bullRedis});
 
emailWorker.on("completed", (job) => {
    console.log(`✅ Completed job ${job.id}`);
  });
  
  emailWorker.on("failed", (job, err) => {
    console.error(`❌ Failed job ${job.id}:`, err);
  });
  