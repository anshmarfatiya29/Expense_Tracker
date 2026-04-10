// A:\Expense Tracker\backend\controllers\suggestionController.js
require("dotenv").config();

const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ---------------- Gemini Helper ----------------

// Default model: env se lo, warna gemini-flash-latest use karo
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

// Helper: safely get Gemini model (can be null if key missing)
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("⚠ GEMINI_API_KEY is missing. Falling back to static suggestions.");
    return null;
  }

  console.log("Using Gemini model:", DEFAULT_GEMINI_MODEL);

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: DEFAULT_GEMINI_MODEL });
};

// --- Budget Suggestion Controller ---
exports.getBudgetSuggestion = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch last 30 days of expenses
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const expenses = await Expense.find({
      userId,
      date: { $gte: last30Days },
    });

    if (!expenses || expenses.length === 0) {
      return res.status(200).json({
        suggestion:
          "You don't have enough recent expense data. Start by tracking your expenses for a few weeks so we can create a better budget suggestion for you.",
      });
    }

    // 2. Summarize expenses by category
    const expenseSummary = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const formattedSummary = Object.entries(expenseSummary)
      .map(([category, amount]) => `${category}: ₹${amount.toFixed(2)}`)
      .join(", ");

    // 3. Try to use Gemini if available
    const model = getGeminiModel();

    if (!model) {
      // No API key → fallback suggestion
      return res.status(200).json({
        suggestion: `Here’s a basic budget tip based on your last 30 days:\n\n- Focus on the categories where you're spending the most.\n- Try to cut 5–10% from high-spend areas like ${Object.keys(
          expenseSummary
        ).join(
          ", "
        )}.\n- Set a monthly limit and review your expenses every week.`,
      });
    }

    const prompt = `
      You are a friendly financial advisor.
      User's 30-day expense summary (in INR): ${formattedSummary}.
      Give a short, actionable budget suggestion in markdown bullet points.
      Keep it under 120 words.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestionText = response.text();

      return res.status(200).json({ suggestion: suggestionText });
    } catch (aiError) {
      console.error("Gemini error in getBudgetSuggestion:", aiError);

      // Fallback if AI call fails
      return res.status(200).json({
        suggestion:
          "We couldn't generate an AI-based budget suggestion right now. As a starting point, try the 50-30-20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
      });
    }
  } catch (error) {
    console.error("Error getting budget suggestion:", error);

    // Final safety fallback – still return 200 so UI can show text
    return res.status(200).json({
      suggestion:
        "Something went wrong while analyzing your expenses. Try again later, and meanwhile focus on tracking all your expenses and avoiding unnecessary purchases.",
    });
  }
};

// --- Income Growth Suggestion Controller ---
exports.getIncomeGrowthSuggestion = async (req, res) => {
  try {
    const userId = req.user.id;

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentIncomes = await Income.find({
      userId,
      date: { $gte: last30Days },
    });

    const recentExpenses = await Expense.find({
      userId,
      date: { $gte: last30Days },
    });

    const totalIncome = recentIncomes.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalExpense = recentExpenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const savings = totalIncome - totalExpense;

    if (totalIncome === 0 && totalExpense === 0) {
      return res.status(200).json({
        suggestion:
          "We don't have enough recent income/expense data. Add your income and expenses for this month to get better income growth suggestions.",
      });
    }

    if (savings <= 0) {
      return res.status(200).json({
        suggestion:
          "Right now your savings are negative or zero. Focus on reducing non-essential expenses and increasing your income (freelancing, part-time work, or skill upgrade) so you can first build a positive saving balance.",
      });
    }

    const model = getGeminiModel();

    if (!model) {
      // No API key → basic income-growth suggestion
      return res.status(200).json({
        suggestion: `You saved about ₹${savings.toFixed(
          2
        )} in the last 30 days. Consider:\n\n- Increasing savings to at least 20% of your income.\n- Learning a high-demand skill (e.g., web dev, design, data).\n- Exploring safe options like bank FDs or SIPs after researching.\n\nThis is general information, not financial advice.`,
      });
    }

    const prompt = `
      You are a financial educator.
      The user saved ₹${savings.toFixed(
        2
      )} in the last 30 days (India context).
      Suggest 3–5 simple, practical ways to grow their income and use these savings wisely.
      Mention that this is not personalized financial advice, just general education.
      Answer in markdown bullet points and keep it under 130 words.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestionText = response.text();

      return res.status(200).json({ suggestion: suggestionText });
    } catch (aiError) {
      console.error("Gemini error in getIncomeGrowthSuggestion:", aiError);

      return res.status(200).json({
        suggestion:
          "We couldn't generate an AI-based income growth suggestion right now. In general, focus on building skills that increase your earning potential, creating multiple income streams, and investing regularly in low-cost, diversified options after doing proper research. This is not financial advice, only education.",
      });
    }
  } catch (error) {
    console.error("Error getting income growth suggestion:", error);

    return res.status(200).json({
      suggestion:
        "Something went wrong while generating your income growth suggestion. Try again later and meanwhile keep tracking your income, expenses, and savings consistently.",
    });
  }
};
