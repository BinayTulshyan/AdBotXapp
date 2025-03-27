import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MetaAuthButton } from "./MetaAuthButton";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Timezone is required")
});

type FormValues = z.infer<typeof formSchema>;

interface CreateMetaAccountProps {
  businessName?: string;
  onSuccess?: () => void;
}

export function CreateMetaAccount({ businessName = "", onSuccess }: CreateMetaAccountProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName,
      email: "",
      country: "US",
      currency: "USD",
      timezone: "America/New_York"
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      await apiRequest("/api/meta/create-account", {
        method: "POST",
        body: JSON.stringify(values)
      });
      
      // Invalidate user data to refresh meta account connection status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Success",
        description: "Meta Ad Account created successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create Meta Ad Account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create New Meta Ad Account</CardTitle>
        <CardDescription>
          Create a new Meta Ads Account by authorizing with Meta
          and providing your business information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            First, connect your Meta account to allow Adsy to create an ad account:
          </p>
          <MetaAuthButton
            onSuccess={() => {
              setIsAuthenticated(true);
              toast({
                title: "Connected",
                description: "Now fill out the form below to create your ad account"
              });
            }}
            className="w-full"
          />
        </div>
        
        <div className="pt-4">
          {!isAuthenticated ? (
            <p className="text-sm text-amber-500">Connect to Meta first before creating an ad account</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Fill out your business information to create a new ad account:
              </p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                              <SelectItem value="JP">Japan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="CAD">CAD ($)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="AUD">AUD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="JPY">JPY (¥)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="America/New_York">Eastern Time</SelectItem>
                              <SelectItem value="America/Chicago">Central Time</SelectItem>
                              <SelectItem value="America/Denver">Mountain Time</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                              <SelectItem value="Europe/London">London</SelectItem>
                              <SelectItem value="Europe/Paris">Paris</SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                              <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Ad Account"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs text-muted-foreground mt-2">
          By creating a Meta Ad Account, you agree to their advertising policies and terms of service.
        </p>
      </CardFooter>
    </Card>
  );
}