import { createRoot } from "react-dom/client";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./components/App.jsx";

createRoot(document.getElementById("root")).render(
  <div className="min-h-screen bg-gray-50">
    <ToastContainer position="top-right" />
    <App />
  </div>
);
