"use client";
import { useUser } from "@clerk/nextjs";
import { createContext, ReactNode, useContext } from "react";

interface MyProviderProps {
  children: ReactNode;
}

interface AppContextType {
  user: ReturnType<typeof useUser>["user"];
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider: React.FC<MyProviderProps> = ({ children }) => {
  const { user } = useUser();

  const value = {
    user,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
