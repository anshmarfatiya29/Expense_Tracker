// A:\Expense Tracker\frontend\expense-tracker\src\pages\Dashboard\Suggestions.jsx

import React, { useState, useContext } from "react"; // 👈 Import useContext
import { UserContext } from "../../context/userContext"; // 👈 Import UserContext
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuSparkles } from "react-icons/lu";
import ReactMarkdown from "react-markdown";

const Suggestions = () => {
    useUserAuth();

    // 👇 Get suggestions and updaters from the global context
    const {
        budgetSuggestion,
        growthSuggestion,
        updateBudgetSuggestion,
        updateGrowthSuggestion,
    } = useContext(UserContext);

    // We only need local state for loading indicators
    const [loading, setLoading] = useState({ budget: false, growth: false });

    const fetchBudgetSuggestion = async () => {
        setLoading({ ...loading, budget: true });
        try {
            const response = await axiosInstance.get(API_PATHS.SUGGESTIONS.GET_BUDGET);
            // 👇 Use the context updater function
            updateBudgetSuggestion(response.data.suggestion);
        } catch (error) {
            console.error("Error fetching budget suggestion:", error);
            // 👇 Use the context updater function
            updateBudgetSuggestion("Sorry, we couldn't generate a suggestion at this time.");
        } finally {
            setLoading({ ...loading, budget: false });
        }
    };

    const fetchIncomeGrowthSuggestion = async () => {
        setLoading({ ...loading, growth: true });
        try {
            const response = await axiosInstance.get(API_PATHS.SUGGESTIONS.GET_INCOME_GROWTH);
            // 👇 Use the context updater function
            updateGrowthSuggestion(response.data.suggestion);
        } catch (error) {
            console.error("Error fetching income growth suggestion:", error);
            // 👇 Use the context updater function
            updateGrowthSuggestion("Sorry, we couldn't generate a suggestion at this time.");
        } finally {
            setLoading({ ...loading, growth: false });
        }
    };

    // ... (The SuggestionCard component remains exactly the same)
    const SuggestionCard = ({ title, suggestion, isLoading, onGenerate }) => (
        <div className="card h-full flex flex-col">
            <h5 className="text-lg font-semibold">{title}</h5>
            <div className="mt-4 flex-grow">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Generating your suggestion...</p>
                    </div>
                ) : suggestion ? (
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{suggestion}</ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">
                        Click the button below to get your personalized AI suggestion.
                    </p>
                )}
            </div>
            <button
                className="add-btn add-btn-fill mt-6 w-full justify-center"
                onClick={onGenerate}
                disabled={isLoading}
            >
                <LuSparkles />
                {isLoading ? "Thinking..." : "Generate Suggestion"}
            </button>
        </div>
    );
    

    return (
        <DashboardLayout activeMenu="AI Suggestions">
            {/* ... (The rest of your JSX remains exactly the same) ... */}
            <div className="my-5">
                <h3 className="text-2xl font-bold mb-2">AI-Powered Financial Suggestions</h3>
                <p className="text-gray-500 mb-6">
                    Get personalized insights based on your recent financial activity.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SuggestionCard
                        title="Budget Suggestion"
                        suggestion={budgetSuggestion}
                        isLoading={loading.budget}
                        onGenerate={fetchBudgetSuggestion}
                    />
                    <SuggestionCard
                        title="Income Growth Suggestion"
                        suggestion={growthSuggestion}
                        isLoading={loading.growth}
                        onGenerate={fetchIncomeGrowthSuggestion}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Suggestions;