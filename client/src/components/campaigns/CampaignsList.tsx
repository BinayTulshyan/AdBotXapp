import { AdCampaign } from "@/types";
import CampaignCard from "./CampaignCard";

interface CampaignsListProps {
  campaigns: AdCampaign[];
}

export default function CampaignsList({ campaigns }: CampaignsListProps) {
  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
