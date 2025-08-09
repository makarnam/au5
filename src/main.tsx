import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { Toaster } from "react-hot-toast";
// Ensure apikey header is present for any rare direct REST calls
import "./lib/fetchWithSupabaseHeaders";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  </React.StrictMode>,
);
