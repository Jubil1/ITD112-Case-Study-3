// header.tsx - SAFER VERSION
import { forwardRef } from "react";
import { Link } from "@tanstack/react-router";

const navigationItems = [
  { name: "Dashboard", path: "/" },
  { name: "Geographic", path: "/geographic" },
  { name: "Comparison", path: "/comparison" },
  { name: "Composition", path: "/composition" },
  { name: "Trends", path: "/trends" },
  { name: "Distribution", path: "/distribution" },
  { name: "Relationships", path: "/relationships" },
  { name: "Ranking", path: "/radar" },
  { name: "Flow/Process", path: "/parallel" },
  { name: "Upload Data", path: "/upload" },
  { name: "Data Management", path: "/crud" },
];

const Header = forwardRef<HTMLElement>((_props, ref) => {
  return (
    <header
      ref={ref}
      className="flex flex-col justify-center items-center px-6 py-4 bg-primary border-b border-highlights/30"
    >
      <h1 className="text-2xl md:text-3xl font-inter text-white text-stroke mb-4">
        Filipino Emigration Dashboard
      </h1>
      
      {/* Navigation Tabs */}
      <nav className="flex items-center gap-6 overflow-x-auto pb-2">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="text-white text-sm whitespace-nowrap pb-1 transition-all duration-300 hover:text-highlights border-b-2 border-transparent hover:border-highlights"
            activeProps={{
              className: "text-white text-sm whitespace-nowrap pb-1 border-b-2 border-highlights font-semibold"
            }}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
});

Header.displayName = "Header";

export default Header;