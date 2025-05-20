
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

const NavItems = [
  { path: "/", label: "Dashboard" },
  { path: "/options-calculator", label: "Options Calculator" },
  { path: "/data-management", label: "Data Management" },
  { path: "/cluster-analysis", label: "Cluster Analysis" },
];

const Navbar = () => {
  return (
    <nav className="bg-finance-navy text-white py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="text-finance-lightBlue" />
          <span className="font-bold text-xl">OptionsAnalyzer</span>
        </div>
        <div className="flex space-x-6">
          {NavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "transition-colors hover:text-finance-lightBlue",
                  isActive ? "text-finance-lightBlue font-medium" : "text-gray-300"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
