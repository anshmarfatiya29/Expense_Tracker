// A:\Expense Tracker\backend\routes\suggestionRoutes.js

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getBudgetSuggestion,
  getIncomeGrowthSuggestion,
} = require("../controllers/suggestionController");

const router = express.Router();

// GET /api/v1/suggestions/budget
router.get("/budget", protect, getBudgetSuggestion);

// GET /api/v1/suggestions/income-growth
router.get("/income-growth", protect, getIncomeGrowthSuggestion);

module.exports = router;
