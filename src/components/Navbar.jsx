import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">🎂 Birthday Reminder</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/birthdays" className="hover:underline">Birthdays</Link>
          <Link to="/add" className="hover:underline">Add Birthday</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
