"use client";

import { createContext, useContext, ReactNode } from "react";
import { User } from "@supabase/supabase-js";


type UserContextType = {
  user: User;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  user,
  
}: {
  children: ReactNode;
  user: User;
  
}) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}