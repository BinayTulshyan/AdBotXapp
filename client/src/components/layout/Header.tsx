import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Sidebar from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

interface HeaderProps {
  currentPage: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center md:hidden">
            <button className="text-gray-600" onClick={toggleSidebar}>
              <span className="material-icons">menu</span>
            </button>
            <h1 className="ml-3 text-xl font-bold text-gray-800">Adsy</h1>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-700">{currentPage}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="relative text-gray-600 hover:text-gray-800">
                <span className="material-icons">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </div>
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-800">
                <span className="material-icons">account_circle</span>
              </button>
            </div>
            <Link href="/campaigns">
              <Button className="hidden md:flex items-center">
                <span className="material-icons text-sm mr-1">add</span>
                New Campaign
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
          <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button 
                className="text-gray-500 hover:text-gray-700" 
                onClick={toggleSidebar}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <Sidebar user={user} />
          </div>
        </div>
      )}
    </>
  );
}
