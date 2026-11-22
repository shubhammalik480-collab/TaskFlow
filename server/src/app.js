const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const app = express();
const passport = require("./config/passport");
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(cookieParser());
app.use(passport.initialize());
// Authentication Routes
app.use("/api/auth", authRoutes);

// Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "TaskFlow API is running successfully!",
    });
});


// Test Route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});

module.exports = app;