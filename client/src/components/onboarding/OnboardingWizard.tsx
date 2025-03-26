import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, OnboardingStep, MetaAccountFormData, AdObjectiveFormData } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const connectFormSchema = z.object({
  accountId: z.string().optional(),
  businessName: z.string().optional(),
  email: z.string().email().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

const objectiveFormSchema = z.object({
  objective: z.string().min(1, "Objective is required"),
  description: z.string().min(10, "Please provide a detailed description"),
  targetAudience: z.string().min(5, "Target audience is required"),
  budget: z.string().min(1, "Budget is required"),
  duration: z.string().min(1, "Duration is required"),
});

export default function OnboardingWizard() {
  const [step, setStep] = useState<OnboardingStep>("connect");
  const [connectMethod, setConnectMethod] = useState<"existing" | "new" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  // Form for connecting Meta account
  const connectForm = useForm<MetaAccountFormData>({
    resolver: zodResolver(connectFormSchema),
    defaultValues: {
      businessName: user?.businessName || "",
      email: user?.email || "",
      country: "US",
      currency: "USD",
      timezone: "America/New_York",
    },
  });

  // Form for setting ad objectives
  const objectiveForm = useForm<AdObjectiveFormData>({
    resolver: zodResolver(objectiveFormSchema),
    defaultValues: {
      objective: "",
      description: "",
      targetAudience: "",
      budget: "$50",
      duration: "30 days",
    },
  });

  // Connect to existing Meta Ad account
  const { mutate: connectToExisting, isPending: connectingToExisting } = useMutation({
    mutationFn: async (data: { accountId: string }) => {
      return apiRequest("POST", "/api/meta/connect", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setStep("objectives");
      toast({
        title: "Connected successfully",
        description: "Your Meta Ad account has been connected.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Meta Ad account. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  // Create new Meta Ad account
  const { mutate: createNewAccount, isPending: creatingAccount } = useMutation({
    mutationFn: async (data: MetaAccountFormData) => {
      return apiRequest("POST", "/api/meta/create-account", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setStep("objectives");
      toast({
        title: "Account created",
        description: "Your Meta Ad account has been created successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Account creation failed",
        description: "Failed to create Meta Ad account. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  // Create ad objective
  const { mutate: createObjective, isPending: creatingObjective } = useMutation({
    mutationFn: async (data: AdObjectiveFormData) => {
      return apiRequest("POST", "/api/objectives", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setStep("setup");
      toast({
        title: "Objective saved",
        description: "Your ad objective has been saved successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Failed to save objective",
        description: "An error occurred while saving your objective. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  // Complete onboarding
  const { mutate: completeOnboarding, isPending: completingOnboarding } = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/user/onboarding", { onboardingComplete: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/dashboard");
      toast({
        title: "Onboarding complete",
        description: "You're all set! Welcome to Adsy.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Failed to complete onboarding",
        description: "An error occurred. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const handleConnectFormSubmit = (data: MetaAccountFormData) => {
    if (connectMethod === "existing" && data.accountId) {
      connectToExisting({ accountId: data.accountId });
    } else if (connectMethod === "new") {
      createNewAccount(data);
    }
  };

  const handleObjectiveFormSubmit = (data: AdObjectiveFormData) => {
    createObjective(data);
  };

  const handleSetupComplete = () => {
    completeOnboarding();
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Adsy</CardTitle>
        <CardDescription>
          Let's get your Meta ad campaigns set up for success
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center relative">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                step === "connect" ? "bg-primary text-white" : 
                "bg-gray-200 text-gray-600"
              } font-medium`}>1</div>
              <div className="ml-4 mr-8">
                <p className={`text-sm font-medium ${
                  step === "connect" ? "text-gray-900" : "text-gray-600"
                }`}>Connect</p>
              </div>
              <div className={`flex-1 h-1 ${
                step === "connect" ? "bg-gray-200" : "bg-primary"
              }`}></div>
            </div>
            <div className="flex items-center relative">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                step === "objectives" ? "bg-primary text-white" : 
                step === "setup" ? "bg-primary text-white" :
                "bg-gray-200 text-gray-600"
              } font-medium`}>2</div>
              <div className="ml-4 mr-8">
                <p className={`text-sm font-medium ${
                  step === "objectives" ? "text-gray-900" : 
                  step === "setup" ? "text-gray-900" :
                  "text-gray-600"
                }`}>Objectives</p>
              </div>
              <div className={`flex-1 h-1 ${
                step === "setup" ? "bg-primary" : "bg-gray-200"
              }`}></div>
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                step === "setup" ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
              } font-medium`}>3</div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  step === "setup" ? "text-gray-900" : "text-gray-600"
                }`}>Setup</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step content */}
        {step === "connect" && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect your Meta Ad Account</h3>
            <p className="text-gray-600 mb-6">Connect your existing Meta Ad account or let us create a new one for you.</p>
            
            {!connectMethod ? (
              <div className="flex flex-col space-y-4">
                <Button
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setConnectMethod("existing")}
                >
                  <span className="material-icons mr-2">link</span>
                  Connect Existing Account
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">OR</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full py-6"
                  onClick={() => setConnectMethod("new")}
                >
                  <span className="material-icons mr-2">add_circle</span>
                  Create New Ad Account
                </Button>
              </div>
            ) : (
              <Form {...connectForm}>
                <form onSubmit={connectForm.handleSubmit(handleConnectFormSubmit)} className="space-y-4">
                  {connectMethod === "existing" ? (
                    <FormField
                      control={connectForm.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Ad Account ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your Meta Ad Account ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <>
                      <FormField
                        control={connectForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={connectForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={connectForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="US" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={connectForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <FormControl>
                                <Input placeholder="USD" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={connectForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <FormControl>
                                <Input placeholder="America/New_York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="mr-2"
                      onClick={() => setConnectMethod(null)}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={connectingToExisting || creatingAccount}
                    >
                      {connectingToExisting || creatingAccount
                        ? "Processing..."
                        : "Continue"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        )}
        
        {step === "objectives" && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Define Your Ad Objectives</h3>
            <p className="text-gray-600 mb-6">Tell us what you want to achieve with your Meta ads.</p>
            
            <Form {...objectiveForm}>
              <form onSubmit={objectiveForm.handleSubmit(handleObjectiveFormSubmit)} className="space-y-4">
                <FormField
                  control={objectiveForm.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Objective</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Increase website traffic, Boost product sales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={objectiveForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your business goals in detail" 
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={objectiveForm.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your ideal customers (age, interests, location, etc.)" 
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={objectiveForm.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Input placeholder="$50 per day" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={objectiveForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="30 days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => setStep("connect")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={creatingObjective}
                  >
                    {creatingObjective ? "Saving..." : "Continue"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {step === "setup" && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">You're Almost Ready!</h3>
            <p className="text-gray-600 mb-6">
              Here's what will happen next:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">
                    1
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900">Generate AI Ad Suggestions</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Our AI will analyze your objectives and create custom ad suggestions tailored to your business.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">
                    2
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900">Launch Your Campaigns</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Review, edit, and deploy your AI-generated ads directly to your Meta ad account with just a few clicks.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">
                    3
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900">Track and Optimize</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Monitor your campaign performance and receive AI-powered optimization suggestions to improve results.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => setStep("objectives")}
              >
                Back
              </Button>
              <Button 
                onClick={handleSetupComplete}
                disabled={completingOnboarding}
              >
                {completingOnboarding ? "Finalizing Setup..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
