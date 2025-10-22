// Service Categories for the LocalAssist Marketplace

export const SERVICE_CATEGORIES = [
  'Window Washing',
  'Lawn Care',
  'Tech Support',
  'Pet Sitting',
  'Pet Walking',
  'Tutoring',
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

// Category icons/emojis
export const CATEGORY_ICONS: Record<ServiceCategory, string> = {
  'Window Washing': '🪟',
  'Lawn Care': '🌱',
  'Tech Support': '💻',
  'Pet Sitting': '🐕',
  'Pet Walking': '🦮',
  'Tutoring': '📚',
};

// Category descriptions
export const CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  'Window Washing': 'Professional window cleaning services - sparkling clean windows inside and out',
  'Lawn Care': 'Lawn mowing, trimming, and maintenance to keep your yard looking great',
  'Tech Support': 'Computer, phone, and technology help from savvy young tech experts',
  'Pet Sitting': 'In-home pet care while you\'re away - your pets stay comfortable and happy',
  'Pet Walking': 'Daily dog walking and exercise services to keep your furry friends active',
  'Tutoring': 'Academic tutoring and homework help from honor students and recent grads',
};

// Pricing types
export const PRICING_TYPES = {
  FIXED: 'fixed',
  HOURLY: 'hourly',
  DAILY: 'daily',
  PER_UNIT: 'per_unit', // e.g., per window
  CUSTOM_QUOTE: 'custom_quote',
} as const;

export type PricingType = typeof PRICING_TYPES[keyof typeof PRICING_TYPES];

// Service-specific pricing models
export const SERVICE_PRICING_MODELS: Record<ServiceCategory, PricingType[]> = {
  'Window Washing': [PRICING_TYPES.PER_UNIT], // per window
  'Lawn Care': [PRICING_TYPES.CUSTOM_QUOTE], // custom quote based on description
  'Tech Support': [PRICING_TYPES.HOURLY],
  'Pet Sitting': [PRICING_TYPES.HOURLY, PRICING_TYPES.DAILY],
  'Pet Walking': [PRICING_TYPES.HOURLY, PRICING_TYPES.FIXED], // per walk or hourly
  'Tutoring': [PRICING_TYPES.HOURLY],
};

// Service-specific fields that providers need to specify
export interface ServiceDetails {
  // Window Washing
  pricePerWindow?: number;
  includesScreens?: boolean;
  includesInsideAndOutside?: boolean;

  // Lawn Care
  acceptsCustomQuotes?: boolean;
  servicesOffered?: string[]; // mowing, trimming, edging, etc.

  // Tech Support
  techSupportTypes?: string[]; // computer repair, phone setup, software help, etc.
  remoteSupport?: boolean;

  // Pet Sitting
  hourlyRate?: number;
  dailyRate?: number;
  petsAccepted?: string[]; // dogs, cats, birds, etc.
  overnightAvailable?: boolean;

  // Pet Walking
  walkDuration?: number; // minutes
  perWalkRate?: number;
  maxPetsPerWalk?: number;

  // Tutoring
  subjects?: string[];
  levels?: string[]; // elementary, middle school, high school, college
  onlineAvailable?: boolean;
  inPersonAvailable?: boolean;
}

// Tech support sub-services
export const TECH_SUPPORT_TYPES = [
  'Computer Repair',
  'Phone Setup',
  'Software Installation',
  'Virus Removal',
  'WiFi Setup',
  'Smart Home Setup',
  'Data Backup',
  'Email Setup',
  'Social Media Help',
  'General Troubleshooting',
];

// Tutoring subjects
export const TUTORING_SUBJECTS = [
  'Math',
  'Science',
  'English',
  'History',
  'Foreign Languages',
  'Computer Science',
  'SAT/ACT Prep',
  'Music',
  'Art',
];

// Tutoring levels
export const TUTORING_LEVELS = [
  'Elementary School',
  'Middle School',
  'High School',
  'College',
];

// Lawn care services
export const LAWN_CARE_SERVICES = [
  'Mowing',
  'Trimming/Edging',
  'Leaf Removal',
  'Weeding',
  'Hedge Trimming',
  'Mulching',
  'Seasonal Cleanup',
];

// Pet types
export const PET_TYPES = [
  'Dogs',
  'Cats',
  'Birds',
  'Small Animals (hamsters, rabbits, etc.)',
  'Fish',
  'Reptiles',
];
