import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuthFormData } from "@/types";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
});

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<AuthFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<AuthFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      businessName: "",
      email: "",
    },
  });

  // Login mutation
  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: async (data: AuthFormData) => {
      try {
        const { data: responseData } = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(data)
        });
        return responseData;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/dashboard");
      toast({
        title: "Login successful",
        description: "Welcome back to Adsy!",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Invalid username or password. Please try again.";
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  // Register mutation
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: async (data: AuthFormData) => {
      try {
        const { data: responseData } = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(data)
        });
        return responseData;
      } catch (error) {
        console.error("Registration error:", error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : "An unknown error occurred";
        setRegistrationError(errorMessage);
        throw error;
      }
    },
    onSuccess: () => {
      setRegistrationError(null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/onboarding");
      toast({
        title: "Registration successful",
        description: "Welcome to Adsy! Let's set up your account.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Registration failed. Please try again.";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const onLoginSubmit = (data: AuthFormData) => {
    login(data);
  };

  const onRegisterSubmit = (data: AuthFormData) => {
    register(data);
  };

  return (
    <Card className="w-full max-w-md">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Log in to Adsy</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full mt-2"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="register">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Sign up to start managing your Meta ads with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrationError && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 text-sm">
                <strong>Registration Error:</strong> {registrationError}
              </div>
            )}
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full mt-2"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-center pt-0">
        <p className="text-center text-sm text-gray-500">
          {activeTab === "login" ? (
            <>
              Don't have an account?{" "}
              <button 
                className="text-primary hover:underline" 
                onClick={() => setActiveTab("register")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button 
                className="text-primary hover:underline" 
                onClick={() => setActiveTab("login")}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}
