import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

// Character variants with different colors and styles
const characterVariants = cva(
  "relative flex items-center justify-center rounded-full shadow-lg overflow-hidden",
  {
    variants: {
      character: {
        adsy: "bg-gradient-to-br from-primary to-primary/70",
        meta: "bg-gradient-to-br from-blue-600 to-blue-800",
        audience: "bg-gradient-to-br from-green-600 to-green-800",
        analytics: "bg-gradient-to-br from-purple-600 to-purple-800",
        creative: "bg-gradient-to-br from-amber-600 to-amber-800",
      },
      size: {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-24 h-24",
        xl: "w-32 h-32",
      },
      animation: {
        bounce: "",
        float: "",
        pulse: "",
        wave: "",
        shake: "",
        none: "",
      },
    },
    defaultVariants: {
      character: "adsy",
      size: "md",
      animation: "none",
    },
  }
);

// Animation presets
const animations = {
  bounce: {
    y: [0, -15, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  wave: {
    rotate: [0, 5, 0, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 3,
    },
  },
  none: {},
};

// Emotion expressions for characters
const emotions = {
  happy: "😊",
  excited: "😃",
  surprised: "😲",
  thoughtful: "🤔",
  helpful: "👨‍🏫",
  analytical: "🧐",
  creative: "🎨",
};

type CharacterIconType = "default" | keyof typeof emotions;

// Character icons/faces
const getCharacterIcon = (
  character: CharacterVariants["character"],
  emotion: CharacterIconType = "default"
) => {
  if (emotion !== "default" && emotion in emotions) {
    return emotions[emotion as keyof typeof emotions];
  }

  // Default icons based on character type
  switch (character) {
    case "adsy":
      return "🤖";
    case "meta":
      return "📱";
    case "audience":
      return "👥";
    case "analytics":
      return "📊";
    case "creative":
      return "✨";
    default:
      return "👋";
  }
};

export interface CharacterVariants
  extends VariantProps<typeof characterVariants> {}

export interface TutorialCharacterProps extends CharacterVariants {
  emotion?: CharacterIconType;
  className?: string;
}

export function TutorialCharacter({
  character = "adsy",
  size = "md",
  animation = "none",
  emotion = "default",
  className,
}: TutorialCharacterProps) {
  return (
    <motion.div
      className={characterVariants({ character, size, animation, className })}
      animate={animation && animation !== "none" ? animations[animation] : {}}
    >
      <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
        {getCharacterIcon(character, emotion)}
      </span>
    </motion.div>
  );
}