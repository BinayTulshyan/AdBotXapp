import { useState } from 'react';
import { BusinessTemplate, getAllBusinessTemplates, getTemplateById } from '@/lib/businessTemplates';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, Info } from 'lucide-react';

interface BusinessTemplateSelectorProps {
  onSelect: (template: BusinessTemplate) => void;
  selectedTemplateId?: string;
}

export function BusinessTemplateSelector({ onSelect, selectedTemplateId }: BusinessTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | undefined>(
    selectedTemplateId ? getTemplateById(selectedTemplateId) : undefined
  );
  const [detailTemplate, setDetailTemplate] = useState<BusinessTemplate | undefined>();
  const templates = getAllBusinessTemplates();

  const handleSelect = (template: BusinessTemplate) => {
    setSelectedTemplate(template);
    onSelect(template);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedTemplate?.id === template.id ? 'border-primary border-2' : ''
            }`}
            onClick={() => handleSelect(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className="material-icons text-2xl text-primary">{template.icon}</span>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                {selectedTemplate?.id === template.id && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <CardDescription className="text-sm">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm font-medium">Primary objective: <span className="font-normal">{template.objectives.primary}</span></p>
              <div className="mt-2 flex flex-wrap gap-1">
                {template.adTypes.slice(0, 2).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                ))}
                {template.adTypes.length > 2 && (
                  <Badge variant="outline" className="text-xs">+{template.adTypes.length - 2} more</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs flex items-center" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailTemplate(template);
                    }}
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  {detailTemplate && (
                    <>
                      <DialogHeader>
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-2xl text-primary">{detailTemplate.icon}</span>
                          <DialogTitle>{detailTemplate.name}</DialogTitle>
                        </div>
                        <DialogDescription>{detailTemplate.description}</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Objectives</h4>
                            <p className="text-sm font-medium">Primary: <span className="font-normal">{detailTemplate.objectives.primary}</span></p>
                            <div className="mt-1">
                              <p className="text-sm font-medium mb-1">Secondary:</p>
                              <ul className="text-sm list-disc pl-5">
                                {detailTemplate.objectives.secondary.map((obj) => (
                                  <li key={obj}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Target Audience</h4>
                            <p className="text-sm"><span className="font-medium">Demographics:</span> {detailTemplate.targetAudience.demographics}</p>
                            <div className="mt-1">
                              <p className="text-sm font-medium mb-1">Interests:</p>
                              <div className="flex flex-wrap gap-1">
                                {detailTemplate.targetAudience.interests.map((interest) => (
                                  <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Recommended Ad Types</h4>
                            <div className="flex flex-wrap gap-1">
                              {detailTemplate.adTypes.map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Budget Recommendations</h4>
                            <p className="text-sm"><span className="font-medium">Daily:</span> {detailTemplate.budgetRecommendation.daily}</p>
                            <p className="text-sm"><span className="font-medium">Monthly:</span> {detailTemplate.budgetRecommendation.monthly}</p>
                            <p className="text-sm"><span className="font-medium">Scaling strategy:</span> {detailTemplate.budgetRecommendation.scaling}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Sample Ad Content</h4>
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-sm font-bold">{detailTemplate.sampleAdContent.headline}</p>
                              <p className="text-sm mt-1">{detailTemplate.sampleAdContent.primaryText}</p>
                              <Button size="sm" className="mt-2" variant="secondary">
                                {detailTemplate.sampleAdContent.callToAction}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          handleSelect(detailTemplate);
                        }}>
                          Select This Template
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs px-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(template);
                }}
              >
                Select <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
