import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface MetaAuthButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function MetaAuthButton({ onSuccess, className }: MetaAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMetaAuth = async () => {
    try {
      setIsLoading(true);
      
      // Get the auth URL from the API
      const { data } = await apiRequest<{ authUrl: string }>("/api/meta/auth-url");
      
      if (!data?.authUrl) {
        throw new Error("Failed to get Meta authorization URL");
      }

      // Open a popup for authentication
      const authWindow = window.open(
        data.authUrl,
        "Meta Authorization",
        "width=800,height=600,resizable=yes,scrollbars=yes,status=yes"
      );
      
      if (!authWindow) {
        throw new Error("Popup was blocked. Please allow popups for this site.");
      }

      // Listen for postMessage from the popup
      const handleMessage = (event: MessageEvent) => {
        // Verify the origin in a production environment
        if (event.data?.type === 'META_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          toast({
            title: "Meta Connection Successful",
            description: "Your Meta account has been connected successfully.",
          });
          
          if (onSuccess) {
            onSuccess();
          }
        } else if (event.data?.type === 'META_AUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          toast({
            title: "Meta Connection Failed",
            description: "Failed to connect your Meta account. Please try again.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      };

      window.addEventListener('message', handleMessage);
      
      // Cleanup if the user closes the popup
      const checkPopupClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
      }, 500);

    } catch (error) {
      console.error("Meta auth error:", error);
      toast({
        title: "Meta Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect your Meta account. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleMetaAuth}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Connecting..." : "Connect Meta Account"}
    </Button>
  );
}