import { useRef } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import Header from "../components/header";
import NavBar from "../components/navBar";
import { NavBarProvider } from "../context/navBarContext";

const RootLayout = () => {
  const headerRef = useRef<HTMLElement>(null);
  const navBarRef = useRef<HTMLElement>(null);

  return (
    <div className="app-layout flex flex-col h-screen">
      {/* Empty NavBar component (renders nothing) */}
      <nav className="topbar hidden" role="navigation" aria-label="Main navigation">
        <NavBar ref={navBarRef} />
      </nav>

      <div className="main-content flex-1 flex flex-col overflow-hidden">
        {/* Header now contains the navigation tabs */}
        <Header ref={headerRef} />

        <main
          className="content flex-1 overflow-auto px-4 py-2 bg-primary"
          role="main"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const Route = createRootRoute({
  component: () => {
    return (
      <NavBarProvider>
        <RootLayout />
      </NavBarProvider>
    );
  },
});