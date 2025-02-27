import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mx-auto p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">
        Welcome to Birthday Reminder 🎉
      </h2>
      <p className="mb-4">
        Never forget your friends&apos; birthdays again! Enable notifications and
        install this app as a PWA.
      </p>
      <p className="mb-4 text-sm">
        Make sure to allow notifications for birthday reminders.
      </p>
      <Link
        to="/birthdays"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        View Birthdays
      </Link>
    </div>
  );
};

export default Home;
