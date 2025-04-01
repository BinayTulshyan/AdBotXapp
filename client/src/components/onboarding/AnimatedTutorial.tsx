import { useState, useEffect } from 'react';
import { TutorialOverlay } from './TutorialOverlay';
import { TutorialStep, TutorialStepProps } from './TutorialStep';
import { CharacterVariants } from './TutorialCharacter';

// Tutorial content with steps
export interface TutorialStep extends Omit<TutorialStepProps, 'onNext' | 'onBack' | 'isLastStep'> {
  id: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

interface AnimatedTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps?: TutorialStep[];
  startAt?: number;
  autoStart?: boolean;
  delayStart?: number; // in milliseconds
}

// Default tutorial steps explaining ad management
const defaultTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Adsy!',
    description: (
      <>
        <p>I'm your AI assistant that will help you create and manage effective ad campaigns!</p>
        <p className="mt-2">Let me walk you through the basics of digital advertising.</p>
      </>
    ),
    character: {
      character: 'adsy',
      animation: 'bounce',
      emotion: 'happy',
      size: 'lg'
    },
    position: 'center',
  },
  {
    id: 'objectives',
    title: 'Setting Your Objectives',
    description: (
      <>
        <p>First, we'll help you define clear objectives for your campaigns.</p>
        <p className="mt-2">Whether you want more website visitors, leads, or sales, knowing your goal is the first step to success!</p>
      </>
    ),
    character: {
      character: 'adsy',
      animation: 'float',
      emotion: 'thoughtful',
      size: 'lg'
    },
    position: 'center',
  },
  {
    id: 'audience',
    title: 'Finding Your Audience',
    description: (
      <>
        <p>Next, we'll identify who your ideal customers are.</p>
        <p className="mt-2">The more specific you can be about their interests, demographics, and behaviors, the better your ads will perform!</p>
      </>
    ),
    character: {
      character: 'audience',
      animation: 'pulse',
      emotion: 'default',
      size: 'lg'
    },
    position: 'center',
  },
  {
    id: 'meta-integration',
    title: 'Meta Ads Integration',
    description: (
      <>
        <p>Adsy connects directly with your Meta advertising account.</p>
        <p className="mt-2">This lets you create, manage and track your Facebook and Instagram campaigns all in one place!</p>
      </>
    ),
    character: {
      character: 'meta',
      animation: 'shake',
      emotion: 'default',
      size: 'lg'
    },
    position: 'center',
  },
  {
    id: 'ai-suggestions',
    title: 'AI-Powered Ad Suggestions',
    description: (
      <>
        <p>Our AI analyzes your business, objectives, and target audience to generate creative ad suggestions.</p>
        <p className="mt-2">No more guessing what will work - let AI give you a head start!</p>
      </>
    ),
    character: {
      character: 'creative',
      animation: 'pulse',
      emotion: 'default',
      size: 'lg'
    },
    position: 'center',
  },
  {
    id: 'performance',
    title: 'Performance Tracking',
    description: (
      <>
        <p>Monitor your ad performance with detailed analytics.</p>
        <p className="mt-2">Our dashboard shows you impressions, clicks, conversions, and ROI so you can see what's working.</p>
      </>
    ),
    character: {
      character: 'analytics',
      animation: 'float',
      emotion: 'default',
      size: 'lg'
    },
    position: 'center',
  },
  {
    id: 'optimization',
    title: 'Smart Optimization',
    description: (
      <>
        <p>Adsy constantly analyzes your campaigns and suggests improvements.</p>
        <p className="mt-2">We'll help you adjust targeting, budgets, and creative elements to get better results over time.</p>
      </>
    ),
    character: {
      character: 'adsy',
      animation: 'wave',
      emotion: 'analytical',
      size: 'lg'
    },
    position: 'center',
  },
  {
    id: 'templates',
    title: 'Quick-Start Templates',
    description: (
      <>
        <p>Get started faster with our business-specific templates.</p>
        <p className="mt-2">Choose a template that matches your business type for pre-configured targeting, budget recommendations, and ad formats!</p>
      </>
    ),
    character: {
      character: 'creative',
      animation: 'bounce',
      emotion: 'excited',
      size: 'lg'
    },
    position: 'center',
  },
  {
    id: 'ready',
    title: "You're Ready to Start!",
    description: (
      <>
        <p>Now you know the basics of ad management with Adsy.</p>
        <p className="mt-2">Let's set up your first campaign and start growing your business!</p>
      </>
    ),
    character: {
      character: 'adsy',
      animation: 'bounce',
      emotion: 'excited',
      size: 'lg'
    },
    position: 'center',
  },
];

export function AnimatedTutorial({
  isOpen,
  onClose,
  onComplete,
  steps = defaultTutorialSteps,
  startAt = 0,
  autoStart = true,
  delayStart = 500,
}: AnimatedTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(startAt);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (isOpen && autoStart) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, delayStart);
      
      return () => clearTimeout(timer);
    } else {
      setShowTutorial(isOpen);
    }
  }, [isOpen, autoStart, delayStart]);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setShowTutorial(false);
    onComplete();
  };

  const handleSkip = () => {
    setShowTutorial(false);
    onComplete();
  };

  if (!currentStep) return null;

  return (
    <TutorialOverlay
      isOpen={showTutorial}
      onClose={onClose}
      position={currentStep.position}
      showSkipButton={true}
      onSkip={handleSkip}
    >
      <TutorialStep
        title={currentStep.title}
        description={currentStep.description}
        character={currentStep.character}
        onNext={handleNext}
        onBack={currentStepIndex > 0 ? handleBack : undefined}
        isLastStep={isLastStep}
        customActions={currentStep.customActions}
      />
    </TutorialOverlay>
  );
}