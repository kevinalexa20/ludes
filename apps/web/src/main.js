import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("Elemen root tidak ditemukan");
}
createRoot(rootElement).render(_jsxs(React.StrictMode, { children: [_jsx(App, {}), _jsx(Toaster, { position: "top-center", toastOptions: {
                duration: 4000,
                style: {
                    background: "#FFFFFF",
                    color: "#292524",
                    borderRadius: "1rem",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    border: "1px border #E7E5E4",
                    fontSize: "14px",
                    fontWeight: 500,
                },
            } })] }));
//# sourceMappingURL=main.js.map