import { AdSuggestion } from "@/types";
import AdSuggestionComponent from "@/components/ads/AdSuggestion";

interface SuggestionsListProps {
  suggestions: AdSuggestion[];
}

export default function SuggestionsList({ suggestions }: SuggestionsListProps) {
  return (
    <div className="space-y-6">
      {suggestions.map((suggestion) => (
        <AdSuggestionComponent key={suggestion.id} suggestion={suggestion} />
      ))}
    </div>
  );
}
