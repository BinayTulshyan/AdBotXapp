import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MetaAuthButton } from "./MetaAuthButton";

const formSchema = z.object({
  accountId: z.string().min(1, "Account ID is required")
});

type FormValues = z.infer<typeof formSchema>;

interface ConnectMetaAccountProps {
  onSuccess?: () => void;
}

export function ConnectMetaAccount({ onSuccess }: ConnectMetaAccountProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: ""
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      await apiRequest("/api/meta/connect", {
        method: "POST",
        body: JSON.stringify({ accountId: values.accountId })
      });
      
      // Invalidate user data to refresh meta account connection status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Success",
        description: "Meta Ad Account connected successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Meta Ad Account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Meta Ad Account</CardTitle>
        <CardDescription>
          Connect to an existing Meta Ad Account by authorizing with Meta
          and providing your Ad Account ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            First, connect your Meta account to allow Adsy to manage your ads:
          </p>
          <MetaAuthButton
            onSuccess={() => toast({
              title: "Next Step",
              description: "Now enter your Ad Account ID below"
            })}
            className="w-full"
          />
        </div>
        
        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            After connecting, enter your Ad Account ID:
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Ad Account ID</FormLabel>
                    <FormControl>
                      <Input placeholder="act_123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect Ad Account"}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs text-muted-foreground mt-2">
          You can find your Ad Account ID in the Meta Ads Manager under Account Settings
          or in the URL when viewing your ad account (format: act_123456789).
        </p>
      </CardFooter>
    </Card>
  );
}
