import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from ".//Navbar";
import Footer from "./Footer";
import Home from "../pages/Home";
import BirthdayList from "../pages/BirthdayList";
import AddBirthday from "../pages/AddBirthday";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/birthdays" element={<BirthdayList />} />
            <Route path="/add" element={<AddBirthday />} />
            <Route path="/edit/:id" element={<AddBirthday />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
