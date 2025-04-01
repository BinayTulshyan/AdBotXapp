import { useState } from "react";
import { AdSuggestion, ParsedTargetAudience } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface AdSuggestionProps {
  suggestion: AdSuggestion;
}

export default function AdSuggestionComponent({ suggestion }: AdSuggestionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse the target audience string to an array of objects
  const parsedTargetAudience: ParsedTargetAudience[] = (() => {
    try {
      return JSON.parse(suggestion.targetAudience);
    } catch (e) {
      return [];
    }
  })();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-800">{suggestion.title}</h3>
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-primary" 
            title="Edit"
            onClick={() => setIsEditing(!isEditing)}
          >
            <span className="material-icons">edit</span>
          </button>
          <Link href={`/campaigns/new?suggestionId=${suggestion.id}`}>
            <button className="text-gray-500 hover:text-primary" title="Create Campaign">
              <span className="material-icons">campaign</span>
            </button>
          </Link>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center">
              {suggestion.adType.toLowerCase().includes("carousel") ? (
                <span className="material-icons text-5xl text-gray-400">collections</span>
              ) : suggestion.adType.toLowerCase().includes("video") ? (
                <span className="material-icons text-5xl text-gray-400">videocam</span>
              ) : (
                <span className="material-icons text-5xl text-gray-400">image</span>
              )}
            </div>
          </div>
          <div className="col-span-2 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Headline</h4>
              <p className="text-gray-800">{suggestion.headline}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Primary Text</h4>
              <p className="text-gray-800">{suggestion.primaryText}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Call to Action</h4>
              <p className="text-gray-800">{suggestion.callToAction}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Target Audience</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {parsedTargetAudience.map((audience, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                    {audience.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
