const Queue = require("bull");

const emailQueue = new Queue("emailQueue", {
  redis: { 
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,   // FIXES the error
    enableReadyCheck: false       // Recommended for local Redis
  }
});

module.exports = emailQueue;
