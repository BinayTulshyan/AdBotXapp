/**
 * Business template types for quick-start ad campaigns
 */

export interface BusinessTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  objectives: {
    primary: string;
    secondary: string[];
  };
  targetAudience: {
    demographics: string;
    interests: string[];
    behaviors: string[];
  };
  budgetRecommendation: {
    daily: string;
    monthly: string;
    scaling: string;
  };
  adTypes: string[];
  sampleAdContent: {
    headline: string;
    primaryText: string;
    callToAction: string;
  };
}

export const businessTemplates: BusinessTemplate[] = [
  {
    id: "ecommerce",
    name: "E-commerce Store",
    description: "For online retailers selling products directly to consumers",
    icon: "shopping_cart",
    objectives: {
      primary: "Increase online sales",
      secondary: ["Build brand awareness", "Generate leads", "Grow customer base"]
    },
    targetAudience: {
      demographics: "Adults 25-54, income $40k+",
      interests: ["Online shopping", "Fashion", "Technology", "Home goods"],
      behaviors: ["Online purchasers", "Discount seekers", "Cart abandoners"]
    },
    budgetRecommendation: {
      daily: "$15-50",
      monthly: "$450-1500",
      scaling: "Increase budget by 20% when ROAS exceeds 3x"
    },
    adTypes: ["Carousel", "Collection", "Dynamic Product", "Video"],
    sampleAdContent: {
      headline: "Discover Our Latest Collection",
      primaryText: "Find exactly what you need with our extensive selection. Free shipping on orders over $50!",
      callToAction: "Shop Now"
    }
  },
  {
    id: "local_business",
    name: "Local Business",
    description: "For brick-and-mortar shops, restaurants, and service providers",
    icon: "store",
    objectives: {
      primary: "Increase store visits",
      secondary: ["Promote special offers", "Build community presence", "Boost local awareness"]
    },
    targetAudience: {
      demographics: "Adults 18+, within 10-mile radius",
      interests: ["Local events", "Community involvement", "Dining out", "Local services"],
      behaviors: ["Lives nearby", "Recently moved", "Frequent local searchers"]
    },
    budgetRecommendation: {
      daily: "$5-25",
      monthly: "$150-750",
      scaling: "Increase budget during peak seasons or local events"
    },
    adTypes: ["Location", "Offer", "Event", "Image"],
    sampleAdContent: {
      headline: "Your Neighborhood Favorite",
      primaryText: "Located in the heart of downtown. Stop by today and mention this ad for 10% off your purchase!",
      callToAction: "Get Directions"
    }
  },
  {
    id: "service_business",
    name: "Service Provider",
    description: "For professionals offering services like consulting, legal, or healthcare",
    icon: "work",
    objectives: {
      primary: "Generate qualified leads",
      secondary: ["Build credibility", "Increase appointments", "Expand service area"]
    },
    targetAudience: {
      demographics: "Professionals 30-65, income $60k+",
      interests: ["Professional development", "Business news", "Productivity", "Networking"],
      behaviors: ["Business decision makers", "Service researchers", "Professional network builders"]
    },
    budgetRecommendation: {
      daily: "$10-40",
      monthly: "$300-1200",
      scaling: "Increase budget for high-value service promotions"
    },
    adTypes: ["Lead Form", "Testimonial", "Video", "Image"],
    sampleAdContent: {
      headline: "Expert Solutions for Your Needs",
      primaryText: "Our experienced team of professionals is ready to help you achieve your goals with customized solutions.",
      callToAction: "Book a Consultation"
    }
  },
  {
    id: "saas",
    name: "SaaS / App",
    description: "For software companies, app developers, and subscription services",
    icon: "phone_iphone",
    objectives: {
      primary: "Increase app installs/subscriptions",
      secondary: ["Free trial signups", "Demo requests", "Feature awareness"]
    },
    targetAudience: {
      demographics: "Tech-savvy adults 18-45",
      interests: ["Technology", "Productivity", "Digital tools", "Innovation"],
      behaviors: ["Early adopters", "Subscription service users", "App store browsers"]
    },
    budgetRecommendation: {
      daily: "$25-100",
      monthly: "$750-3000",
      scaling: "Scale based on Customer Acquisition Cost (CAC)"
    },
    adTypes: ["App Install", "Video Demo", "Carousel", "Lead Form"],
    sampleAdContent: {
      headline: "Simplify Your Workflow Today",
      primaryText: "Our platform helps you save 10+ hours per week with automated workflows and intuitive design. Try free for 14 days!",
      callToAction: "Start Free Trial"
    }
  },
  {
    id: "content_creator",
    name: "Content Creator",
    description: "For bloggers, influencers, media sites, and content platforms",
    icon: "video_library",
    objectives: {
      primary: "Increase audience engagement",
      secondary: ["Grow followers", "Increase website traffic", "Boost content views"]
    },
    targetAudience: {
      demographics: "Varied by content niche, typically 18-45",
      interests: ["Entertainment", "Social media", "Digital content", "Specific niche topics"],
      behaviors: ["Content consumers", "Social media engagers", "Media sharers"]
    },
    budgetRecommendation: {
      daily: "$5-30",
      monthly: "$150-900",
      scaling: "Increase for premium content releases"
    },
    adTypes: ["Video", "Image", "Carousel", "Stories"],
    sampleAdContent: {
      headline: "Discover Content You'll Love",
      primaryText: "Unique perspectives and engaging stories delivered directly to you. Join our community of 50,000+ followers!",
      callToAction: "Follow Now"
    }
  },
  {
    id: "education",
    name: "Education & Courses",
    description: "For schools, online courses, workshops, and training programs",
    icon: "school",
    objectives: {
      primary: "Increase course enrollments",
      secondary: ["Information requests", "Webinar signups", "Resource downloads"]
    },
    targetAudience: {
      demographics: "Students and professionals 18-55",
      interests: ["Learning", "Career advancement", "Skill development", "Certifications"],
      behaviors: ["Education searchers", "Career changers", "Professional development seekers"]
    },
    budgetRecommendation: {
      daily: "$10-50",
      monthly: "$300-1500",
      scaling: "Increase before enrollment deadlines"
    },
    adTypes: ["Lead Form", "Video", "Carousel", "Event"],
    sampleAdContent: {
      headline: "Master New Skills for Today's Market",
      primaryText: "Our industry-recognized certification program has helped over 10,000 students advance their careers. Enrollment closes soon!",
      callToAction: "Enroll Today"
    }
  },
  {
    id: "nonprofit",
    name: "Nonprofit / Cause",
    description: "For charities, NGOs, and mission-driven organizations",
    icon: "volunteer_activism",
    objectives: {
      primary: "Increase donations",
      secondary: ["Volunteer recruitment", "Awareness campaigns", "Event attendance"]
    },
    targetAudience: {
      demographics: "Compassionate adults 25-65+",
      interests: ["Social causes", "Community involvement", "Volunteering", "Philanthropy"],
      behaviors: ["Charitable donors", "Volunteers", "Cause supporters"]
    },
    budgetRecommendation: {
      daily: "$5-30",
      monthly: "$150-900",
      scaling: "Increase during fundraising campaigns"
    },
    adTypes: ["Donation", "Video", "Event", "Image"],
    sampleAdContent: {
      headline: "Make a Difference Today",
      primaryText: "Your support helps us create lasting change in communities around the world. Join thousands of supporters making an impact.",
      callToAction: "Donate Now"
    }
  }
];

/**
 * Get a business template by ID
 */
export function getTemplateById(id: string): BusinessTemplate | undefined {
  return businessTemplates.find(template => template.id === id);
}

/**
 * Get all business templates
 */
export function getAllBusinessTemplates(): BusinessTemplate[] {
  return businessTemplates;
}