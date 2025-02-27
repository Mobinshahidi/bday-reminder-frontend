import { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import persianDate from "persian-date";

const BirthdayList = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [fingerprint, setFingerprint] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getList = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/birthdays/${result.visitorId}`
        );
        if (!response.ok) throw new Error("Failed to fetch birthdays");
        setBirthdays(await response.json());
      } catch (error) {
        console.error("Error fetching birthdays:", error);
        toast.error("Failed to fetch birthdays");
      }
    };

    getList();
  }, []);

  const fetchBirthdays = async (visitorId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/birthdays/${visitorId}`
      );
      if (!response.ok) throw new Error("Failed to fetch birthdays");
      const data = await response.json();
      setBirthdays(data);
    } catch (error) {
      console.error("Error fetching birthdays:", error);
      toast.error("Failed to fetch birthdays");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this birthday?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/birthdays/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete birthday");

      setBirthdays(birthdays.filter((b) => b.id !== id));
      await fetchBirthdays(fingerprint);
      toast.success("Birthday deleted successfully");
    } catch (error) {
      console.error("Error deleting birthday:", error);
      toast.error("Failed to delete birthday");
    }
  };

  const handleEdit = (birthday) => {
    // Navigate to the edit page and pass the birthday data
    navigate(`/edit/${birthday.id}`, {
      state: {
        birthdayData: birthday,
        fingerprint: fingerprint,
      },
    });
  };

  useEffect(() => {
    if (birthdays && birthdays.length > 0) {
      checkUpcomingBirthdays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthdays]);

  const showNotification = (name, timing) => {
    if (!("Notification" in window)) return;

    const messages = {
      today: `It's ${name}'s birthday today! 🎉`,
      tomorrow: `${name}'s birthday is tomorrow! 🎈`,
      nextWeek: `${name}'s birthday is in a week! 📅`,
    };

    if (Notification.permission === "granted") {
      new Notification("Birthday Reminder", {
        body: messages[timing],
        icon: "/icon-192x192.png",
        vibrate: [200, 100, 200],
      });
    }
  };

  const checkUpcomingBirthdays = () => {
    const pDate = new persianDate();
    const todayMonth = pDate.month();
    const todayDay = pDate.date();

    const tomorrow = new persianDate().add("days", 1);
    const tomorrowMonth = tomorrow.month();
    const tomorrowDay = tomorrow.date();

    const nextWeek = new persianDate().add("days", 7);
    const nextWeekMonth = nextWeek.month();
    const nextWeekDay = nextWeek.date();

    birthdays.forEach((birthday) => {
      // Today's birthday
      if (birthday.month === todayMonth && birthday.day === todayDay) {
        showNotification(birthday.name, "today");
      }
      // Tomorrow's birthday
      else if (
        birthday.month === tomorrowMonth &&
        birthday.day === tomorrowDay
      ) {
        showNotification(birthday.name, "tomorrow");
      }
      // Next week's birthday
      else if (
        birthday.month === nextWeekMonth &&
        birthday.day === nextWeekDay
      ) {
        showNotification(birthday.name, "nextWeek");
      }
    });
  };

  const exportData = () => {
    try {
      if (!birthdays || birthdays.length === 0) {
        toast.error("No birthdays available to export.");
        return;
      }
      // Data to string
      const dataStr = JSON.stringify(birthdays, null, 2);
      // Data uri for downloading
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;

      const exportFileDefaultName = `birthdays_${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast.success("Birthdays exported successfully");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to export birthdays");
    }
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // Validate imported data
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid data format");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/birthdays/import`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              birthdays: importedData,
              fingerprint,
            }),
          }
        );

        if (!response.ok) throw new Error("Import failed");

        await fetchBirthdays(fingerprint);
        toast.success("Birthdays imported successfully");

        // Clear the file input
        e.target.value = null;
      } catch (error) {
        console.error("Error importing birthdays:", error);
        toast.error(
          "Failed to import birthdays. Make sure the file format is correct."
        );
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
    };

    reader.readAsText(file);
  };

  const getMonthName = (month) => {
    const months = [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ];
    return months[month - 1];
  };

  const filteredBirthdays = birthdays
    .filter(
      (birthday) =>
        birthday.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (monthFilter === "all" || birthday.month === parseInt(monthFilter))
    )
    .sort((a, b) => {
      if (a.month === b.month) {
        return a.day - b.day;
      }
      return a.month - b.month;
    });

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🎂 Birthday List</h2>
      
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option dir="rtl" key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={exportData}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Export Birthdays
        </button>
        <label className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 cursor-pointer text-center">
          Import Birthdays
          <input
            type="file"
            onChange={importData}
            accept=".json"
            className="hidden"
          />
        </label>
      </div>

      {/* Birthday List */}
      <div className="space-y-4">
        {filteredBirthdays.map((birthday) => (
          <div
            key={birthday.id}
            className="p-4 border rounded shadow flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="font-semibold">{birthday.name}</h3>
              <p className="text-gray-600 flex items-center gap-2">
                <span>{getMonthName(birthday.month)}</span>
                <span>{birthday.day}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(birthday)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(birthday.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredBirthdays.length === 0 && (
          <p className="text-center text-gray-500">No birthdays found</p>
        )}
      </div>
    </div>
  );
};

export default BirthdayList;
