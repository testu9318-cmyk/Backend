const session = require("express-session");
const { createClient } = require("redis");
const RedisStore = require("connect-redis").RedisStore;

// Create redis client
const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.connect().catch(console.error);

// Redis connection events for debugging
redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Create store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

// Export session middleware
module.exports = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || "MY_SESSION_SECRET", // Use env variable
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid', // Explicit name
  cookie: {
    sameSite: 'lax',
    httpOnly: true,
    secure: false, // Set to true only in production with HTTPS
    maxAge: 1000 * 60 * 60, // 1 minute
    domain: 'localhost', //  Important for CORS
    path: '/', //  Important for all routes
  },
});