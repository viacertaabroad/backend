// const Queue = require("bull");
// const queue = new Queue("delayed-task", "redis://127.0.0.1:6379");

// queue.process(async (job) => {
//   console.log("✅ Bull Task executed at", new Date().toLocaleTimeString());
// });

// queue.add({}, { delay: 10000 }); // 10 sec delay
