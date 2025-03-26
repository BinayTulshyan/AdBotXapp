import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdCampaign } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">Campaigns</h1>
        <Button onClick={() => setIsCreating(true)}>
          <span className="material-icons text-sm mr-1">add</span>
          New Campaign
        </Button>
      </div>

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
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-gray-400">campaign</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Campaigns</h3>
                  <p className="text-gray-600 mb-4">Start your first campaign to reach your target audience</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <span className="material-icons text-sm mr-1">add</span>
                    Create Campaign
                  </Button>
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
