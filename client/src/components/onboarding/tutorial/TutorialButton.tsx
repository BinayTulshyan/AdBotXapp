import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { AnimatedTutorial } from './AnimatedTutorial';

interface TutorialButtonProps extends ButtonProps {
  label?: string;
  icon?: 'help' | 'play';
  tutorialCompleteCallback?: () => void;
}

export function TutorialButton({
  label = 'Tutorial',
  icon = 'help',
  tutorialCompleteCallback,
  ...props
}: TutorialButtonProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    if (tutorialCompleteCallback) {
      tutorialCompleteCallback();
    }
  };

  const IconComponent = icon === 'help' ? HelpCircle : PlayCircle;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTutorial(true)}
        {...props}
      >
        <IconComponent className="h-4 w-4 mr-2" />
        {label}
      </Button>

      <AnimatedTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </>
  );
}