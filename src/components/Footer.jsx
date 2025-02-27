import { useEffect, useState } from "react";
import persianDate from "persian-date";
const Footer = () => {
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    const pDate = new persianDate();
    setTodayDate(`${pDate.year()}/${pDate.month()}/${pDate.date()}`);
  }, []);
  return (
    <footer className="bg-gray-800 text-white text-center p-3 mt-6">
      <p>{todayDate}</p>
    </footer>
  );
};

export default Footer;
