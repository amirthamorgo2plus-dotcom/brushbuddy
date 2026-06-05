// Simple shared types for the whole app.

export type Painter = {
  id: string;
  name: string;
  photo: string;
  service: string;         // service category slug (e.g. "painting", "deep-cleaning")
  city: string;
  area?: string;           // locality within the city (e.g. "RS Puram")
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
  service?: string;        // service category slug
  type: string;            // sub-type within the service
  city: string;
  area: string;            // e.g. "2 BHK", "Office hall"
  budget: number;
  details: string;
  postedBy: string;
  postedAt: string;
  status: "open" | "booked" | "done";
};
