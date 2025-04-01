import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  showSkipButton?: boolean;
  onSkip?: () => void;
}

export function TutorialOverlay({
  isOpen,
  onClose,
  children,
  position = 'center',
  showSkipButton = true,
  onSkip,
}: TutorialOverlayProps) {
  const positionClasses = {
    top: 'items-start justify-center pt-16',
    right: 'items-center justify-end pr-16',
    bottom: 'items-end justify-center pb-16',
    left: 'items-center justify-start pl-16',
    center: 'items-center justify-center',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex"
          onClick={onClose}
        >
          <div className={`w-full h-full flex ${positionClasses[position]}`}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-background rounded-lg shadow-xl max-w-md w-full m-4 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 flex space-x-2">
                {showSkipButton && onSkip && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onSkip} 
                    className="text-xs"
                  >
                    Skip tutorial
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}