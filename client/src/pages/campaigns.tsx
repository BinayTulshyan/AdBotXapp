import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AdCampaign } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CampaignsList from "@/components/campaigns/CampaignsList";
import NewCampaignForm from "@/components/campaigns/NewCampaignForm";

export default function Campaigns() {
  const [selectedTab, setSelectedTab] = useState("active");
  const [isCreating, setIsCreating] = useState(false);

  const { data: campaigns, isLoading } = useQuery<AdCampaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Filter campaigns based on selected tab
  const activeCampaigns = campaigns?.filter(campaign => campaign.status === "ACTIVE") || [];
  const pausedCampaigns = campaigns?.filter(campaign => campaign.status === "PAUSED") || [];
  const completedCampaigns = campaigns?.filter(campaign => campaign.status === "COMPLETED") || [];

  if (isCreating) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create New Campaign</h1>
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            <span className="material-icons text-sm mr-1">arrow_back</span>
            Back to Campaigns
          </Button>
        </div>
        <NewCampaignForm onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />
      </div>
    );
  }

  const [, navigate] = useLocation();
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">Campaigns</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/templates')}>
            <span className="material-icons text-sm mr-1">category</span>
            Use Template
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <span className="material-icons text-sm mr-1">add</span>
            New Campaign
          </Button>
        </div>
      </div>
      
      {(campaigns?.length === 0 && !isLoading) && (
        <Card className="mb-8 border-blue-100 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <span className="material-icons text-blue-500 mr-2">tips_and_updates</span>
              Quick-Start with Templates
            </CardTitle>
            <CardDescription>
              Jump-start your advertising with pre-configured templates for your business type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our templates include recommended objectives, audience targeting, and creative guidelines
              optimized for different business types – from e-commerce to local services.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              onClick={() => navigate('/templates')}
            >
              Browse Templates
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active
            {!isLoading && <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs bg-primary text-white rounded-full">{activeCampaigns.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused
            {!isLoading && <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs bg-gray-200 text-gray-600 rounded-full">{pausedCampaigns.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {!isLoading && <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs bg-gray-200 text-gray-600 rounded-full">{completedCampaigns.length}</span>}
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : (
          <>
            <TabsContent value="active">
              {activeCampaigns.length > 0 ? (
                <CampaignsList campaigns={activeCampaigns} />
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-icons text-gray-400">campaign</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Campaigns</h3>
                    <p className="text-gray-600 mb-4">Start your first campaign to reach your target audience</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      <Button onClick={() => navigate('/templates')} variant="outline">
                        <span className="material-icons text-sm mr-1">category</span>
                        Use a Template
                      </Button>
                      <Button onClick={() => setIsCreating(true)}>
                        <span className="material-icons text-sm mr-1">add</span>
                        Create Campaign
                      </Button>
                    </div>
                  </div>
                  
                  <Card className="border-blue-100 bg-blue-50/50">
                    <CardHeader className="pb-2 flex flex-row items-center">
                      <div className="mr-4 p-2 bg-blue-100 rounded-full">
                        <span className="material-icons text-blue-500">speed</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">Quick-Start with Industry Templates</CardTitle>
                        <CardDescription>
                          Pre-configured campaigns based on your business type
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ul className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        <li className="flex items-center text-sm"><span className="material-icons text-green-500 text-sm mr-1">check_circle</span> Optimized audience targeting</li>
                        <li className="flex items-center text-sm"><span className="material-icons text-green-500 text-sm mr-1">check_circle</span> Budget recommendations</li>
                        <li className="flex items-center text-sm"><span className="material-icons text-green-500 text-sm mr-1">check_circle</span> Ad format selection</li>
                        <li className="flex items-center text-sm"><span className="material-icons text-green-500 text-sm mr-1">check_circle</span> Sample ad content</li>
                        <li className="flex items-center text-sm"><span className="material-icons text-green-500 text-sm mr-1">check_circle</span> Industry benchmarks</li>
                        <li className="flex items-center text-sm"><span className="material-icons text-green-500 text-sm mr-1">check_circle</span> Scaling strategies</li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="default" 
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        onClick={() => navigate('/templates')}
                      >
                        Browse Templates
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paused">
              {pausedCampaigns.length > 0 ? (
                <CampaignsList campaigns={pausedCampaigns} />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Paused Campaigns</h3>
                  <p className="text-gray-600">You don't have any paused campaigns at the moment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedCampaigns.length > 0 ? (
                <CampaignsList campaigns={completedCampaigns} />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Completed Campaigns</h3>
                  <p className="text-gray-600">You don't have any completed campaigns yet</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
