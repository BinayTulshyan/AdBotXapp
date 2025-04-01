import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { MetaAccountSetup } from "@/components/meta";
import { useLocation } from "wouter";
import { AnimatedTutorial } from "./tutorial/AnimatedTutorial";
import { TutorialButton } from "./tutorial/TutorialButton";
import { PlayCircle } from "lucide-react";

// Step 1: Business Objective
const objectiveSchema = z.object({
  objective: z.string().min(1, "Please select an objective"),
  description: z.string().min(10, "Please provide more details about your objective").max(500, "Description is too long"),
  targetAudience: z.string().min(10, "Please provide more details about your target audience").max(500, "Target audience description is too long"),
  budget: z.string().min(1, "Please enter your budget"),
  duration: z.string().min(1, "Please select a duration"),
});

type ObjectiveFormValues = z.infer<typeof objectiveSchema>;

// Step 2: Meta Account Setup
// (uses MetaAccountSetup component)

// Main Onboarding Wizard Component
export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [objectiveData, setObjectiveData] = useState<ObjectiveFormValues | null>(null);
  const [showTutorial, setShowTutorial] = useState(true); // Auto-show tutorial on first load
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const objectiveForm = useForm<ObjectiveFormValues>({
    resolver: zodResolver(objectiveSchema),
    defaultValues: {
      objective: "",
      description: "",
      targetAudience: "",
      budget: "",
      duration: "",
    }
  });

  const handleObjectiveSubmit = async (values: ObjectiveFormValues) => {
    try {
      setIsLoading(true);
      
      // Save the form data
      setObjectiveData(values);
      
      // Submit to API
      await apiRequest("/api/objectives", {
        method: "POST",
        body: JSON.stringify(values)
      });
      
      toast({
        title: "Business objective saved",
        description: "Now let's connect your Meta Ads account",
      });
      
      // Move to next step
      setStep(2);
    } catch (error) {
      console.error("Error saving objective:", error);
      toast({
        title: "Error",
        description: "Failed to save business objective. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaAccountSetupSuccess = () => {
    // Invalidate user data
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    
    toast({
      title: "Onboarding complete!",
      description: "You're all set to start managing your ads.",
    });
    
    // Redirect to dashboard
    setLocation("/dashboard");
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('adsy_tutorial_viewed', 'true');
  };

  // Check if the tutorial has been viewed before
  useEffect(() => {
    const tutorialViewed = localStorage.getItem('adsy_tutorial_viewed');
    if (tutorialViewed === 'true') {
      setShowTutorial(false);
    }
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-2">Welcome to Adsy</h1>
          
          <TutorialButton 
            label="Restart Tutorial" 
            icon="play"
            tutorialCompleteCallback={handleTutorialComplete}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70"
          />
        </div>
        
        <p className="text-muted-foreground">Let's get your account set up in just a few steps.</p>
        
        <div className="flex items-center mt-6">
          <div className={`h-2 w-1/2 rounded-l-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`h-2 w-1/2 rounded-r-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className={step >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}>Business Objective</span>
          <span className={step >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}>Meta Account</span>
        </div>
      </div>
      
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your advertising goals</CardTitle>
            <CardDescription>
              This information will help us provide tailored ad suggestions and optimization recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...objectiveForm}>
              <form onSubmit={objectiveForm.handleSubmit(handleObjectiveSubmit)} className="space-y-6">
                <FormField
                  control={objectiveForm.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's your primary advertising objective?</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an objective" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
                          <SelectItem value="TRAFFIC">Website Traffic</SelectItem>
                          <SelectItem value="ENGAGEMENT">Post Engagement</SelectItem>
                          <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                          <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                          <SelectItem value="APP_INSTALLS">App Installs</SelectItem>
                          <SelectItem value="VIDEO_VIEWS">Video Views</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This helps us determine the best type of ads to create for your campaigns.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={objectiveForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe your business and what you're promoting</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., We're an online boutique launching a summer collection featuring sustainable clothing for women aged 25-40..." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        The more details you provide, the better ad suggestions we can generate.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={objectiveForm.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who is your target audience?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Women aged 25-40 living in urban areas, interested in sustainable fashion and ethical shopping..." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Include demographics, interests, behaviors, and any other relevant details.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={objectiveForm.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's your monthly advertising budget?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Under $500">Under $500</SelectItem>
                            <SelectItem value="$500 - $1,000">$500 - $1,000</SelectItem>
                            <SelectItem value="$1,000 - $2,500">$1,000 - $2,500</SelectItem>
                            <SelectItem value="$2,500 - $5,000">$2,500 - $5,000</SelectItem>
                            <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
                            <SelectItem value="$10,000+">$10,000+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={objectiveForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How long do you plan to run your campaigns?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                            <SelectItem value="1 month">1 month</SelectItem>
                            <SelectItem value="3 months">3 months</SelectItem>
                            <SelectItem value="6 months">6 months</SelectItem>
                            <SelectItem value="12 months">12 months</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Continue to Meta Account Setup"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect your Meta Advertising Account</CardTitle>
            <CardDescription>
              Connect to an existing Meta Ad Account or create a new one to manage your ads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetaAccountSetup onSuccess={handleMetaAccountSetupSuccess} />
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)} 
              className="mt-4"
            >
              Back to Business Objective
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Animated Tutorial */}
      <AnimatedTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
        autoStart={true}
        delayStart={1000}
      />
    </div>
  );
}