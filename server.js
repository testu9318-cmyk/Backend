const express = require("express");
const app = express();
const userStatus = require("./routes/status-route");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user-route");
const coursesRoutes = require("./routes/courese-route");
const RoundRoutes = require("./routes/round-route");
const TemplateRoutes = require("./routes/template-route");
const EmailRoutes = require("./routes/email-route");
const CompaignRoutes = require("./routes/campaign-route");
const queueRoutes = require('./routes/queueRoutes');
const sessionMiddleware = require("./config/session");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");


app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 204
}));
dotenv.config();
connectDB();

// 1. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Session Middleware (MUST BE FIRST before routes!)
app.use(sessionMiddleware);

// 3. Public Routes (no auth)
app.use("/auth", authRoutes);

// 4. Protected Routes (Apply authMiddleware BEFORE all /api routes)
app.use("/api", authMiddleware);

// 5. All your protected /api routes
app.use("/api/status", userStatus);
app.use("/api", userRoutes);
app.use("/api", coursesRoutes);
app.use("/api", RoundRoutes);
app.use("/api", TemplateRoutes);
app.use("/api", EmailRoutes);
app.use("/api", CompaignRoutes);
app.use("/api/queue", queueRoutes);
 // Protect all /api routes with authentication


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
