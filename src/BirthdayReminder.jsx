import { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import Alert from "./Alert";
import persianDate from "persian-date";
import { toast } from "react-toastify";

const BirthdayReminder = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [newBirthday, setNewBirthday] = useState({
    name: "",
    month: "",
    day: "",
  });
  const [fingerprint, setFingerprint] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [notification, setNotification] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    const pDate = new persianDate();
    setTodayDate(`${pDate.year()}/${pDate.month()}/${pDate.date()}`);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize fingerprint
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);

        // Request notification permission
        if ("Notification" in window) {
          await Notification.requestPermission();
        }

        // Fetch initial birthdays
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/birthdays/${result.visitorId}`
        );
        if (!response.ok) throw new Error("Failed to fetch birthdays");
        const data = await response.json();
        setBirthdays(data);
      } catch (error) {
        console.error("Error initializing app:", error);
        toast.error("Failed to initialize app");
      }
    };

    initApp();
  }, []); // Run only once on mount

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
      // Also show toast notification
      toast.info(messages[timing]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const month = parseInt(newBirthday.month);
    const day = parseInt(newBirthday.day);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      toast.error("Invalid date");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/birthdays`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newBirthday.name,
            month,
            day,
            fingerprint,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add birthday");

      // Fetch updated birthdays
      const updatedResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/birthdays/${fingerprint}`
      );
      const updatedData = await updatedResponse.json();
      setBirthdays(updatedData);

      setNewBirthday({ name: "", month: "", day: "" });
      toast.success("Birthday added successfully");

      // Check birthdays after adding new one

      checkUpcomingBirthdays();
    } catch (error) {
      console.error("Error adding birthday:", error);
      toast.error("Failed to add birthday");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/birthdays/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newBirthday.name,
            month: parseInt(newBirthday.month),
            day: parseInt(newBirthday.day),
            fingerprint,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update birthday");

      await fetchBirthdays(fingerprint);
      setNewBirthday({ name: "", month: "", day: "" });
      setEditingId(null);
      toast.success("Birthday updated successfully");
    } catch (error) {
      console.error("Error updating birthday:", error);
      toast.error("Failed to update birthday");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this birthday?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/birthdays/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete birthday");

      await fetchBirthdays(fingerprint);
      toast.success("Birthday deleted successfully");
    } catch (error) {
      console.error("Error deleting birthday:", error);
      toast.error("Failed to delete birthday");
    }
  };

  const handleEdit = (birthday) => {
    setEditingId(birthday._id);
    setNewBirthday({
      name: birthday.name,
      month: birthday.month.toString(),
      day: birthday.day.toString(),
    });
  };

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(birthdays, null, 2);
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Birthday Reminder</h1>
        <div className="text-gray-600">{todayDate}</div>
      </div>

      {notification && <Alert>{notification}</Alert>}

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

      {/* Form */}
      <form
        onSubmit={editingId ? handleUpdate : handleSubmit}
        className="mb-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={newBirthday.name}
            onChange={(e) =>
              setNewBirthday({ ...newBirthday, name: e.target.value })
            }
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
              value={newBirthday.month}
              onChange={(e) =>
                setNewBirthday({ ...newBirthday, month: e.target.value })
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
              value={newBirthday.day}
              onChange={(e) =>
                setNewBirthday({ ...newBirthday, day: e.target.value })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {editingId ? "Update Birthday" : "Add Birthday"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setNewBirthday({ name: "", month: "", day: "" });
            }}
            className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel Edit
          </button>
        )}
      </form>

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
            key={birthday._id}
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
                onClick={() => handleDelete(birthday._id)}
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

export default BirthdayReminder;
