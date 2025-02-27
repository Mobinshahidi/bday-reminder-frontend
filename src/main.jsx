import { createRoot } from "react-dom/client";
import "./index.css";
import BirthdayReminder from "./BirthdayReminder.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <div className="min-h-screen bg-gray-50">
    <ToastContainer position="top-right" />
    <BirthdayReminder />
  </div>
);
