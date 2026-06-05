import { Painter, Review, Job } from "./types";

// Friendly sample data so the app looks alive before real painters sign up.
// Launching in Coimbatore first, with nearby Tamil Nadu cities ready.

// Kept for any painting-specific use; services define their own sub-types now.
export const SKILLS = ["Interior", "Exterior", "Texture", "Wood Polish", "Wall Putty"];

export const CITIES = ["Coimbatore", "Tiruppur", "Erode", "Salem"];

// Local areas (neighbourhoods) within each city. Coimbatore is our launch city.
export const AREAS: Record<string, string[]> = {
  Coimbatore: [
    "RS Puram",
    "Gandhipuram",
    "Peelamedu",
    "Saravanampatti",
    "Singanallur",
    "Ramanathapuram",
    "Vadavalli",
    "Ganapathy",
    "Race Course",
    "Saibaba Colony",
    "Ukkadam",
    "Thudiyalur",
    "Kuniyamuthur",
    "Sulur",
  ],
  Tiruppur: [],
  Erode: [],
  Salem: [],
};

export function areasFor(city: string): string[] {
  return AREAS[city] ?? [];
}

export const painters: Painter[] = [
  {
    id: "p1",
    name: "Ravi Kumar",
    photo: "https://i.pravatar.cc/300?img=12",
    service: "painting",
    city: "Coimbatore",
    area: "RS Puram",
    skills: ["Interior", "Texture", "Wall Putty"],
    about:
      "I have painted homes for 8 years. I keep the place clean and finish on time. Smooth walls are my speciality!",
    pricePerDay: 900,
    rating: 4.8,
    reviewCount: 42,
    jobsDone: 120,
    verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600",
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600",
    ],
  },
  {
    id: "p2",
    name: "Anjali Sharma",
    photo: "https://i.pravatar.cc/300?img=45",
    service: "painting",
    city: "Coimbatore",
    area: "Gandhipuram",
    skills: ["Interior", "Wood Polish"],
    about:
      "Friendly painter who loves bright happy colors. I help you pick shades that suit your home.",
    pricePerDay: 1100,
    rating: 4.9,
    reviewCount: 67,
    jobsDone: 180,
    verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=600",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600",
    ],
  },
  {
    id: "p3",
    name: "Mohammed Irfan",
    photo: "https://i.pravatar.cc/300?img=33",
    service: "waterproofing",
    city: "Coimbatore",
    area: "Peelamedu",
    skills: ["Terrace", "Bathroom", "Walls"],
    about:
      "Waterproofing expert. Your terrace and walls stay leak-free in rain and sun. Safe and tidy work.",
    pricePerDay: 1300,
    rating: 4.7,
    reviewCount: 38,
    jobsDone: 95,
    verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600",
    ],
  },
  {
    id: "p4",
    name: "Suresh Patil",
    photo: "https://i.pravatar.cc/300?img=8",
    service: "painting",
    city: "Coimbatore",
    area: "Saravanampatti",
    skills: ["Interior", "Exterior", "Texture"],
    about:
      "All-round painter for homes and shops. Fair price, no hidden charges. I explain every step.",
    pricePerDay: 1000,
    rating: 4.6,
    reviewCount: 25,
    jobsDone: 70,
    verified: false,
    portfolio: [
      "https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600",
    ],
  },
  {
    id: "p5",
    name: "Lakshmi Nair",
    photo: "https://i.pravatar.cc/300?img=20",
    service: "deep-cleaning",
    city: "Coimbatore",
    area: "Vadavalli",
    skills: ["Home Deep Clean", "Kitchen", "Bathroom"],
    about:
      "Sparkling deep cleaning for homes and offices. I treat your home like my own. Many happy families!",
    pricePerDay: 950,
    rating: 5.0,
    reviewCount: 51,
    jobsDone: 140,
    verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    ],
  },
  {
    id: "p6",
    name: "Deepak Verma",
    photo: "https://i.pravatar.cc/300?img=15",
    service: "epoxy",
    city: "Tiruppur",
    skills: ["Factory", "Warehouse", "Showroom"],
    about:
      "Epoxy flooring for factories and warehouses. Strong team, fast work, good safety. Free site visit first.",
    pricePerDay: 1500,
    rating: 4.5,
    reviewCount: 19,
    jobsDone: 60,
    verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600",
    ],
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    painterId: "p1",
    customerName: "Priya R.",
    stars: 5,
    quality: 5,
    onTime: 5,
    cleanliness: 5,
    value: 4,
    text: "Ravi did a lovely job in our living room. Walls are so smooth! He cleaned up every day.",
    photos: ["https://images.unsplash.com/photo-1618220179428-22790b461013?w=400"],
    date: "2026-05-20",
    reply: "Thank you Priya! It was a pleasure painting your home.",
  },
  {
    id: "r2",
    painterId: "p1",
    customerName: "Karthik M.",
    stars: 5,
    quality: 5,
    onTime: 4,
    cleanliness: 5,
    value: 5,
    text: "Very good work and fair price. Finished my 2 BHK in 3 days. Highly recommend.",
    photos: [],
    date: "2026-04-11",
  },
  {
    id: "r3",
    painterId: "p2",
    customerName: "Sneha T.",
    stars: 5,
    quality: 5,
    onTime: 5,
    cleanliness: 5,
    value: 5,
    text: "Anjali helped me choose the perfect colors. My kids' room looks amazing now!",
    photos: ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400"],
    date: "2026-05-28",
  },
  {
    id: "r4",
    painterId: "p3",
    customerName: "Imran S.",
    stars: 4,
    quality: 4,
    onTime: 5,
    cleanliness: 4,
    value: 4,
    text: "Good waterproofing work on terrace. No leaks this monsoon so far. Happy.",
    photos: [],
    date: "2026-05-02",
  },
];

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Paint my 2 BHK flat",
    service: "painting",
    type: "Interior",
    city: "Coimbatore",
    area: "2 BHK (~900 sq ft)",
    budget: 18000,
    details: "Need full interior painting. Walls have small cracks. Want light colors.",
    postedBy: "Meena",
    postedAt: "2026-06-01",
    status: "open",
  },
  {
    id: "j2",
    title: "Terrace waterproofing before rains",
    service: "waterproofing",
    type: "Terrace",
    city: "Coimbatore",
    area: "Independent house",
    budget: 35000,
    details: "Outside walls need fresh paint and terrace waterproofing before rains.",
    postedBy: "Rajesh",
    postedAt: "2026-05-29",
    status: "open",
  },
  {
    id: "j3",
    title: "Office deep cleaning",
    service: "deep-cleaning",
    type: "Office",
    city: "Coimbatore",
    area: "Office hall (~1500 sq ft)",
    budget: 12000,
    details: "Full deep cleaning of our office before reopening — floors, glass, washrooms.",
    postedBy: "Vikram",
    postedAt: "2026-05-25",
    status: "open",
  },
];

// Helpers ----------------------------------------------------------

export function getPainter(id: string) {
  return painters.find((p) => p.id === id);
}

export function getReviewsFor(painterId: string) {
  return reviews.filter((r) => r.painterId === painterId);
}
