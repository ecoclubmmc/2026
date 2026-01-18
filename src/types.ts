export type Theme = {
  primaryColor: string;
  secondaryColor: string;
};

export type FormField = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'date' | 'number' | 'textarea';
  options?: string[]; // for select
  required: boolean;
};

export type EventCategory = 'general' | 'campus' | 'visit';

export type Competition = {
  name: string;
  whatsappLink: string;
};

export type Event = {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  venue: string;
  description: string;
  image: string; // Thumbnail/Card image
  badgeEmoji: string; // Emoji
  badgeName: string;
  formFields: FormField[];
  coverImage?: string; // Event cover photo
  galleries?: string[]; // Event photo gallery
  competitions?: Competition[]; // Competition options with links
  rules?: string[]; // Event rules
};

export type Badge = {
  id: string;
  eventId: string;
  name: string;
  emoji: string;
  status: 'locked' | 'pending' | 'active';
  unlockedAt?: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  department: string;
  year: string;
  mobile?: string; // Added mobile number
  role: 'student' | 'admin' | 'secretary';
  badges: Badge[];
  batch: string; // Restoring batch
  registeredEvents: string[]; // Array of event IDs
  avatar: string; // Avatar ID
};

export type Registration = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  eventTitle: string;
  timestamp: string;
  formData: Record<string, any>;
  mobile: string; // Mandatory mobile number
  competition?: string; // Selected competition name (optional)
};

export type SiteContent = {
  heroTitle: string;
  heroSubtitle: string;
  history: string;
  mission: string;
  aboutTitle: string;
  aboutSubtitle: string;
  works: { title: string; desc: string; icon: string }[];
  favicon?: string;
  socialLinks?: {
    whatsapp: string;
    instagram: string;
  };
  backgroundImage?: string;
};

export const DEFAULT_CONTENT: SiteContent = {
  heroTitle: "",
  heroSubtitle: "",
  history: "",
  mission: "",
  aboutTitle: "Our Mission",
  aboutSubtitle: "Empowering the next generation of environmental leaders at Madras Medical College.",
  works: [],
  favicon: "",
  socialLinks: {
    whatsapp: "",
    instagram: ""
  },
  backgroundImage: ""
};

// Default avatar options for user profiles
export const DefaultAvatars = [
  { id: 'eco1', emoji: '🌱', color: '#7BC043', name: 'Seedling' },
  { id: 'eco2', emoji: '🌳', color: '#6B8E23', name: 'Oak Tree' },
  { id: 'eco3', emoji: '🍃', color: '#9ACD32', name: 'Leaf' },
  { id: 'eco4', emoji: '♻️', color: '#00A86B', name: 'Recycle' },
  { id: 'eco5', emoji: '🌍', color: '#228B22', name: 'Earth' },
  { id: 'eco6', emoji: '🌿', color: '#3CB371', name: 'Herb' },
];

export type Secretary = {
  id: string;
  name: string;
  role: string; // e.g., "General Secretary"
  image: string; // URL or emoji
  description: string;
  order: number; // For display order
};
