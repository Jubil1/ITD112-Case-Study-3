import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface NavBarContextType {
  // Simplified context - no hover state needed for topbar
}

const NavBarContext = createContext<NavBarContextType | undefined>(undefined);

export const useNavBar = () => {
  const context = useContext(NavBarContext);
  if (context === undefined) {
    throw new Error("useNavBar must be used within a NavBarProvider");
  }
  return context;
};

export const NavBarProvider = ({ children }: { children: ReactNode }) => {
  const value = {};

  return (
    <NavBarContext.Provider value={value}>{children}</NavBarContext.Provider>
  );
};
