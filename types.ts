
export interface Program {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  image: string;
  bio: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar: string;
}
