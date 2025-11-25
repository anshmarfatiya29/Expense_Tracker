require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");

const app = express();

// --- Middleware ---

// CORS Configuration
// Deployment ke time environment variable 'CLIENT_URL' use hoga,
// aur agar wo nahi mila toh '*' (sabko allow) karega fallback ke liye.
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*", 
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

// --- Database Connection ---
connectDB();

// --- Routes ---

// 1. Health Check Route (Important for Deployment)
// Render par deploy karne ke baad jab aap URL open karenge, ye message dikhega.
app.get("/", (req, res) => {
    res.status(200).send("Expense Tracker API is running successfully!");
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/suggestions", suggestionRoutes);

// Static Files
// Note: Render ke free plan par restart hone par uploaded images delete ho sakti hain.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));