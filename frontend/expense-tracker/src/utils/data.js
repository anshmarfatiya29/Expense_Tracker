import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuLogOut,
    LuBrainCircuit,
} from "react-icons/lu";

export const SIDE_MANU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/dashboard",
    },
    {
        id: "02",
        label: "Income",
        icon: LuWalletMinimal,
        path: "/income",
    },
    {
        id: "03",
        label: "Expense",
        icon: LuHandCoins,
        path: "/expense",
    },

    {
        id: "04", // 👈 Give it a new ID
        label: "AI Suggestions",
        icon: LuBrainCircuit,
        path: "/suggestions",
    },

    {
        id: "06",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];