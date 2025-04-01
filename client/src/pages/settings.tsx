import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { mutate: disconnectMetaAccount, isPending: isDisconnecting } = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/meta/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Account disconnected",
        description: "Your Meta Ad account has been disconnected.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Failed to disconnect",
        description: "An error occurred while disconnecting your Meta Ad account.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditingAccount(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const handleDisconnectMetaAccount = () => {
    if (window.confirm("Are you sure you want to disconnect your Meta Ad account? This cannot be undone.")) {
      disconnectMetaAccount();
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const data = {
      businessName: formData.get("businessName") as string,
      email: formData.get("email") as string,
    };
    
    updateProfile(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-3/4" />
              </div>
            ) : isEditingAccount ? (
              <form onSubmit={handleSaveProfile}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" defaultValue={user?.username} disabled />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" name="businessName" defaultValue={user?.businessName} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" defaultValue={user?.email} type="email" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditingAccount(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500 text-sm">Username</Label>
                  <p className="text-gray-800">{user?.username}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Business Name</Label>
                  <p className="text-gray-800">{user?.businessName}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Email Address</Label>
                  <p className="text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <Button onClick={() => setIsEditingAccount(true)}>Edit Profile</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meta Ad Account */}
        <Card>
          <CardHeader>
            <CardTitle>Meta Ad Account</CardTitle>
            <CardDescription>Manage your connected Meta Ad account</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : user?.metaAdAccountConnected ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-12 h-12 flex items-center justify-center bg-blue-100 text-primary rounded-lg">
                    <span className="material-icons">facebook</span>
                  </span>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Connected Account</h3>
                    <p className="text-sm text-gray-600">
                      Account ID: {user.metaAdAccountId || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500">Disconnect this Meta Ad account</p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDisconnectMetaAccount}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-gray-400">link_off</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Connected Account</h3>
                <p className="text-gray-600 mb-4">
                  You don't have a Meta Ad account connected
                </p>
                <Button>
                  <span className="material-icons text-sm mr-1">link</span>
                  Connect Meta Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Performance Alerts</h3>
                  <p className="text-sm text-gray-500">Receive alerts when your campaign performance changes significantly</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Optimization Suggestions</h3>
                  <p className="text-sm text-gray-500">Receive notifications about new AI optimization suggestions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Campaign Status Updates</h3>
                  <p className="text-sm text-gray-500">Get notified when your campaign status changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive a daily email summary of your campaign performance</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
