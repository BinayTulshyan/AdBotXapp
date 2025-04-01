import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { TutorialCharacter, TutorialCharacterProps } from './TutorialCharacter';
import { motion } from 'framer-motion';

export interface TutorialStepProps {
  title: string;
  description: ReactNode;
  character?: TutorialCharacterProps;
  onNext?: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
  showBackButton?: boolean;
  customActions?: ReactNode;
}

export function TutorialStep({
  title,
  description,
  character = { character: 'adsy', animation: 'bounce', emotion: 'happy', size: 'lg' },
  onNext,
  onBack,
  isLastStep = false,
  showBackButton = true,
  customActions,
}: TutorialStepProps) {
  return (
    <div className="p-6 flex flex-col">
      <div className="flex items-center justify-center mb-6">
        <TutorialCharacter {...character} />
      </div>
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
        
        <div className="text-muted-foreground text-center mb-6">
          {typeof description === 'string' ? (
            <p>{description}</p>
          ) : (
            description
          )}
        </div>
      </motion.div>

      {customActions ? (
        <div className="mt-2">{customActions}</div>
      ) : (
        <div className="flex justify-between items-center mt-2">
          {showBackButton && onBack ? (
            <Button variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {onNext && (
            <Button onClick={onNext}>
              {isLastStep ? 'Get Started' : 'Next'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}