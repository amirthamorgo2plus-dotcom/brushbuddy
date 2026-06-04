// Simple shared types for the whole app.

export type Painter = {
  id: string;
  name: string;
  photo: string;
  city: string;
  skills: string[];        // e.g. "Interior", "Exterior", "Waterproofing"
  about: string;
  pricePerDay: number;     // starting day rate in ₹
  rating: number;          // 0 - 5 average
  reviewCount: number;
  jobsDone: number;
  verified: boolean;
  portfolio: string[];     // image urls (before/after work photos)
  lat?: number;            // map location (optional)
  lng?: number;
};

export type Review = {
  id: string;
  painterId: string;
  customerName: string;
  stars: number;           // overall 1 - 5
  quality: number;
  onTime: number;
  cleanliness: number;
  value: number;
  text: string;
  photos: string[];
  date: string;            // ISO date
  reply?: string;          // painter's reply
};

export type Job = {
  id: string;
  title: string;
  type: string;            // Interior / Exterior / etc
  city: string;
  area: string;            // e.g. "2 BHK", "Office hall"
  budget: number;
  details: string;
  postedBy: string;
  postedAt: string;
  status: "open" | "booked" | "done";
};
