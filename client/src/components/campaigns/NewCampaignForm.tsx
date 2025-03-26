import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AdObjective, AdSuggestion, AdCampaignFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdSuggestionComponent from "@/components/ads/AdSuggestion";

interface NewCampaignFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const campaignFormSchema = z.object({
  suggestedAdId: z.string().optional(),
  campaignName: z.string().min(1, "Campaign name is required"),
  status: z.string(),
  budget: z.string().min(1, "Budget is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  objective: z.string().min(1, "Objective is required"),
});

export default function NewCampaignForm({ onCancel, onSuccess }: NewCampaignFormProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>();

  // Extract suggestion ID from URL if coming from suggestions page
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const suggestionId = params.get("suggestionId");
    if (suggestionId) {
      setSelectedSuggestionId(suggestionId);
      form.setValue("suggestedAdId", suggestionId);
    }
  }, [location]);

  const { data: objectives } = useQuery<AdObjective[]>({
    queryKey: ["/api/objectives"],
  });

  const { data: suggestions } = useQuery<AdSuggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  const selectedSuggestion = suggestions?.find(s => s.id.toString() === selectedSuggestionId);

  const form = useForm<AdCampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      campaignName: "",
      status: "ACTIVE",
      budget: "$50",
      startDate: new Date().toISOString(),
      objective: "",
    },
  });

  // Update form values when a suggestion is selected
  useEffect(() => {
    if (selectedSuggestion) {
      const objective = objectives?.find(o => o.id === selectedSuggestion.objectiveId);
      
      form.setValue("campaignName", `Campaign: ${selectedSuggestion.title}`);
      if (objective) {
        form.setValue("objective", objective.objective);
      }
    }
  }, [selectedSuggestion, objectives, form]);

  // Update dates in the form
  useEffect(() => {
    if (dateRange?.from) {
      form.setValue("startDate", dateRange.from.toISOString());
      
      if (dateRange.to) {
        form.setValue("endDate", dateRange.to.toISOString());
      } else {
        form.setValue("endDate", undefined);
      }
    }
  }, [dateRange, form]);

  const { mutate: createCampaign, isPending } = useMutation({
    mutationFn: async (data: AdCampaignFormData) => {
      return apiRequest("POST", "/api/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign created",
        description: "Your new campaign has been created successfully.",
        duration: 3000,
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Campaign creation failed",
        description: "An error occurred while creating your campaign. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const onSubmit = (data: AdCampaignFormData) => {
    // Convert the suggestedAdId to a number if present
    if (data.suggestedAdId) {
      data.suggestedAdId = parseInt(data.suggestedAdId);
    }
    
    createCampaign(data);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>
            Set up a new Meta ad campaign to reach your target audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Based on Ad Suggestion (Optional)</Label>
                  <Select 
                    value={selectedSuggestionId} 
                    onValueChange={(value) => {
                      setSelectedSuggestionId(value);
                      form.setValue("suggestedAdId", value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an ad suggestion (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {suggestions?.filter(s => !s.deployed).map((suggestion) => (
                        <SelectItem key={suggestion.id} value={suggestion.id.toString()}>
                          {suggestion.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSuggestion && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <AdSuggestionComponent suggestion={selectedSuggestion} />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="campaignName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Objective</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an objective" />
                          </SelectTrigger>
                          <SelectContent>
                            {objectives?.map((objective) => (
                              <SelectItem key={objective.id} value={objective.objective}>
                                {objective.objective}
                              </SelectItem>
                            ))}
                            <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
                            <SelectItem value="TRAFFIC">Traffic</SelectItem>
                            <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                            <SelectItem value="APP_INSTALLS">App Installs</SelectItem>
                            <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $50 per day" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Campaign Duration</Label>
                  <div className="mt-1">
                    <DatePickerWithRange 
                      selected={dateRange}
                      onSelect={setDateRange}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PAUSED">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
