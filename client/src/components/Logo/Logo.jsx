import logo from "../../assets/images/logo.png";
import React from "react";
import { FaRocket, FaFeatherAlt } from "react-icons/fa";

const Logo = ({ type = "combo" }) => {
  const logoText = <span className="text-xl font-bold text-primary">JobTracker</span>;

  switch (type) {
    case "icon":
      return <FaRocket className="text-3xl text-primary" />;

    case "text":
      return logoText;

    case "combo":
      return (
        <div className="flex items-center gap-2">
          <FaFeatherAlt className="text-2xl text-primary" />
          {logoText}
        </div>
      );

    case "monogram":
      return <span className="text-2xl font-black text-primary">JT</span>;

    case "emblem":
      return (
        <div className="bg-primary text-white px-4 py-1 rounded-full text-lg font-semibold shadow-md">
          JobTracker
        </div>
      );

    default:
      return logoText;
  }
};

export default Logo;
