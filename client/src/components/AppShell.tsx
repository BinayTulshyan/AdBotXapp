import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

interface AppShellProps {
  children: ReactNode;
  currentPage: string;
}

export default function AppShell({ children, currentPage }: AppShellProps) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <Sidebar user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
