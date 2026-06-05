// All the services offered "under one roof".
// Each service has its own sub-types (skills) shown in forms & filters.

export type Service = {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  gradient: string; // tailwind gradient classes
  skills: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "painting",
    name: "Painting",
    emoji: "🎨",
    tagline: "Interior, exterior & decorative",
    gradient: "from-brand-coral to-brand-violet",
    skills: ["Interior", "Exterior", "Texture", "Wood Polish", "Wall Putty"],
  },
  {
    slug: "deep-cleaning",
    name: "Deep Cleaning",
    emoji: "🧼",
    tagline: "Homes, offices, kitchens",
    gradient: "from-brand-teal to-brand-sky",
    skills: ["Home Deep Clean", "Kitchen", "Bathroom", "Sofa & Carpet", "Office", "Post-construction"],
  },
  {
    slug: "waterproofing",
    name: "Waterproofing",
    emoji: "💧",
    tagline: "Terrace, bathroom, tanks",
    gradient: "from-brand-sky to-brand-violet",
    skills: ["Terrace", "Bathroom", "Basement", "Water Tank", "Walls"],
  },
  {
    slug: "epoxy",
    name: "Epoxy Flooring",
    emoji: "🏭",
    tagline: "Seamless, tough floors",
    gradient: "from-brand-sunny to-brand-coral",
    skills: ["Factory", "Warehouse", "Showroom", "Parking", "Hospital"],
  },
];

export const DEFAULT_SERVICE = "painting";

export function getService(slug?: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function serviceName(slug?: string): string {
  return getService(slug)?.name ?? "Service";
}

export function serviceEmoji(slug?: string): string {
  return getService(slug)?.emoji ?? "🛠️";
}

// Sub-types for a service (or all of them combined when no service chosen).
export function skillsForService(slug?: string): string[] {
  const s = getService(slug);
  if (s) return s.skills;
  return Array.from(new Set(SERVICES.flatMap((x) => x.skills)));
}
