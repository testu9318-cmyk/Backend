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



app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'https://claude.ai'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use('/api/queue', queueRoutes);


// Load environment variables
dotenv.config();
// db connetion

connectDB();
app.use(express.json()); // for parsing JSON in POST requests
app.use(cors());

app.use(express.json());

// Register routes
app.use("/api/status", userStatus);
app.use("/api", userRoutes);
app.use("/api", coursesRoutes);
app.use("/api", RoundRoutes);
app.use("/api", TemplateRoutes);
app.use("/api", EmailRoutes);
app.use("/api", CompaignRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
