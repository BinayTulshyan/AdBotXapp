import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface SidebarProps {
  user?: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to logout",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-accent text-3xl">insights</span>
          <h1 className="text-2xl font-bold text-gray-800">Adsy</h1>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        <Link href="/dashboard">
          <a className={cn(
            "flex items-center px-4 py-3 rounded-lg",
            location === "/dashboard" 
              ? "text-gray-700 bg-gray-100" 
              : "text-gray-600 hover:bg-gray-100"
          )}>
            <span className="material-icons mr-3">dashboard</span>
            <span className="font-medium">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/campaigns">
          <a className={cn(
            "flex items-center px-4 py-3 rounded-lg",
            location === "/campaigns" 
              ? "text-gray-700 bg-gray-100" 
              : "text-gray-600 hover:bg-gray-100"
          )}>
            <span className="material-icons mr-3">campaign</span>
            <span className="font-medium">Campaigns</span>
          </a>
        </Link>
        
        <Link href="/suggestions">
          <a className={cn(
            "flex items-center px-4 py-3 rounded-lg",
            location === "/suggestions" 
              ? "text-gray-700 bg-gray-100" 
              : "text-gray-600 hover:bg-gray-100"
          )}>
            <span className="material-icons mr-3">auto_awesome</span>
            <span className="font-medium">AI Suggestions</span>
          </a>
        </Link>
        
        <Link href="/performance">
          <a className={cn(
            "flex items-center px-4 py-3 rounded-lg",
            location === "/performance" 
              ? "text-gray-700 bg-gray-100" 
              : "text-gray-600 hover:bg-gray-100"
          )}>
            <span className="material-icons mr-3">analytics</span>
            <span className="font-medium">Performance</span>
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={cn(
            "flex items-center px-4 py-3 rounded-lg",
            location === "/settings" 
              ? "text-gray-700 bg-gray-100" 
              : "text-gray-600 hover:bg-gray-100"
          )}>
            <span className="material-icons mr-3">settings</span>
            <span className="font-medium">Settings</span>
          </a>
        </Link>
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="material-icons text-gray-600">person</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.businessName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button 
              className="ml-auto text-gray-400 hover:text-gray-600"
              onClick={handleLogout}
            >
              <span className="material-icons">logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
