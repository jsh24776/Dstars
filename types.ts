
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

export interface MembershipPlan {
  id: number;
  name: string;
  duration: string;
  duration_count: number;
  price: number;
  status: 'active' | 'inactive' | string;
  features: string[];
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar: string;
}
