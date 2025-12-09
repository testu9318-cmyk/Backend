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


app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 204
}));

app.use('/api/queue', queueRoutes);


dotenv.config();

connectDB();
app.use(express.json()); // for parsing JSON in POST requests

app.use(express.json());

// Register routes
app.use("/api/status", userStatus);
app.use("/api", userRoutes);
app.use("/api", coursesRoutes);
app.use("/api", RoundRoutes);
app.use("/api", TemplateRoutes);
app.use("/api", EmailRoutes);
app.use("/api", CompaignRoutes);
app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true })); 

app.use("/api/auth", authRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
