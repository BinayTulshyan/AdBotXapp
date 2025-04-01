import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BusinessTemplateSelector } from '@/components/templates/BusinessTemplateSelector';
import { BusinessTemplate } from '@/lib/businessTemplates';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleTemplateSelect = (template: BusinessTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCreateCampaign = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a template to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create an objective based on the template
      const { data: objectiveData } = await apiRequest('/api/objectives', {
        method: 'POST',
        body: JSON.stringify({
          name: `${selectedTemplate.name} Campaign`,
          description: selectedTemplate.objectives.primary,
          objective: selectedTemplate.objectives.primary,
          targetAudience: selectedTemplate.targetAudience.demographics,
          budget: selectedTemplate.budgetRecommendation.daily,
          duration: "30 days"
        })
      });

      if (!objectiveData) {
        throw new Error('Failed to create campaign objective');
      }

      // Assert the type with the expected structure
      const objectiveId = (objectiveData as { id: number }).id;

      // Generate ad suggestions based on the template
      const { data: suggestionsData } = await apiRequest('/api/suggestions/generate', {
        method: 'POST',
        body: JSON.stringify({
          objectiveId
        })
      });

      if (!suggestionsData) {
        throw new Error('Failed to generate ad suggestions');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/objectives'] });
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });

      toast({
        title: "Template applied successfully",
        description: `Your ${selectedTemplate.name} campaign has been created with recommended settings.`,
      });

      // Navigate to the campaign creation page with the new objective ID
      navigate(`/campaigns/create?objectiveId=${objectiveId}`);
    } catch (error: any) {
      toast({
        title: "Error applying template",
        description: error.message || "There was a problem creating your campaign from the template.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Quick-Start Templates</h1>
        <p className="text-muted-foreground">
          Choose a template tailored to your business type for optimized campaign settings and creative recommendations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Business Type</CardTitle>
          <CardDescription>
            Each template includes recommended objectives, audience targeting, budget allocations, and ad formats optimized for different business models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="specialized">Specialized</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <BusinessTemplateSelector
                onSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
              />
            </TabsContent>
            <TabsContent value="popular">
              <BusinessTemplateSelector
                onSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
              />
            </TabsContent>
            <TabsContent value="specialized">
              <BusinessTemplateSelector
                onSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/campaigns')}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCampaign} 
            disabled={!selectedTemplate || isLoading}
          >
            {isLoading ? 'Creating...' : 'Use This Template'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}