import cron from "node-cron";

console.log("🟢 Cron Scheduler Task Running...");

// Runs every minute
// min hour dayOfMonth month day of week
cron.schedule("* * * * *", () => {
  console.log("1st Cron task executed at", new Date().toLocaleTimeString());
});
cron.schedule("40 15 * * *", () => {
  console.log("2nd Cron task executed at", new Date().toLocaleTimeString());
});
