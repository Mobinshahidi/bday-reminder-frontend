import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { toast } from "react-toastify";

const AddBirthday = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [fingerprint, setFingerprint] = useState(""); // Store fingerprint
  const [birthday, setBirthday] = useState({
    name: "",
    month: "",
    day: "",
  }); 

  // Fetch fingerprint when component mounts
  useEffect(() => {
    const fetchFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId); // Save fingerprint locally

      // If editing, pre-fill the form with passed birthday data
      if (location.state?.birthdayData) {
        setBirthday(location.state.birthdayData); // Populate fields with existing birthday data
      }
    };

    fetchFingerprint();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, month, day } = birthday;

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      toast.error("Invalid date");
      return;
    }

    const method = birthday.id ? "PUT" : "POST"; // PUT if editing, POST if adding
    const url = birthday.id
      ? `${import.meta.env.VITE_API_URL}/api/birthdays/${birthday.id}`
      : `${import.meta.env.VITE_API_URL}/api/birthdays`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, month, day, fingerprint }),
      });

      if (!response.ok) throw new Error("Failed to save birthday");

      toast.success(birthday.id ? "Birthday updated!" : "Birthday added!");
      navigate("/birthdays"); 
    } catch (error) {
      toast.error(error.message || "Failed to save birthday");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        {birthday.id ? "Edit Birthday" : "Add Birthday"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={birthday.name || ""}
            onChange={(e) => setBirthday({ ...birthday, name: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Month (1-12)
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={birthday.month || ""}
              onChange={(e) =>
                setBirthday({ ...birthday, month: parseInt(e.target.value) })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Day (1-31)</label>
            <input
              type="number"
              min="1"
              max="31"
              value={birthday.day || ""}
              onChange={(e) =>
                setBirthday({ ...birthday, day: parseInt(e.target.value) })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 mt-8 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {birthday.id ? "Update Birthday" : "Add Birthday"}
        </button>
      </form>
    </div>
  );
};

export default AddBirthday;
