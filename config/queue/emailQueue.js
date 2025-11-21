const Queue = require("bull");

const emailQueue = new Queue("emailQueue", {
  redis: { 
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,   // FIXES the error
    enableReadyCheck: false       // Recommended for local Redis
  }
});
emailQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

emailQueue.on('error', (error) => {
  console.error('Queue error:', error);
});
module.exports = emailQueue;
