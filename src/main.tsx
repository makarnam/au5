import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { Toaster } from "react-hot-toast";
// Ensure apikey header is present for any rare direct REST calls
import "./lib/fetchWithSupabaseHeaders";
import { useAuthStore } from "./store/authStore";

console.log("main.tsx: Starting app initialization...");

// Initialize auth store
const initializeApp = async () => {
  try {
    await useAuthStore.getState().initialize();
    console.log("Auth store initialized successfully");
  } catch (error) {
    console.error("Failed to initialize auth store:", error);
    // Continue anyway to allow the app to load
  }
};

// Initialize before rendering
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </>
    </React.StrictMode>,
  );
  
  console.log("main.tsx: App rendered to DOM");
});
