
import { Program, Trainer, PricingPlan, Testimonial } from './types';

export const PROGRAMS: Program[] = [
  {
    id: '1',
    title: 'Elite Performance',
    description: 'High-intensity metabolic conditioning designed for those seeking peak physical thresholds.',
    image: '/imgs/fit.jpg'
  },
  {
    id: '2',
    title: 'Strength & Form',
    description: 'Master the fundamentals of powerlifting and hypertrophy with expert biomechanical guidance.',
    image: '/imgs/elite.jpeg'
  },
  {
    id: '3',
    title: 'Stamina Flow',
    description: 'A hybrid approach combining endurance cardio with mobility-focused recovery sessions.',
    image: '/imgs/pain.jpg'
  }
];

export const TRAINERS: Trainer[] = [
  {
    id: '1',
    name: 'Chris',
    specialty: 'Olympic Lifting',
    bio: 'Multiple-time Classic Physique Mr. Olympia champion known for redefining modern aesthetics. Chris represents discipline, symmetry, and championship-level bodybuilding built through relentless precision.',
    image: '/imgs/chris.jpg'
  },
  {
    id: '2',
    name: 'Sam',
    specialty: 'Mobility & Rehab',
    bio: 'Widely recognized for his raw, transparent approach to training, Sam has inspired a new generation through authentic lifting content and an uncompromising pursuit of size and strength.',
    image: '/imgs/sam.jpg'
  },
  {
    id: '3',
    name: 'David',
    specialty: 'Conditioning',
    bio: 'Globally known for one of the most influential physique transformations in modern fitness. David blends heavy compound strength with aesthetic development, motivating millions toward long-term physical evolution.',
    image: '/imgs/david2.jpg'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Essentials',
    price: '789',
    features: ['24/7 Gym Access', 'Modern Equipment', 'Standard Lockers', 'App Access']
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '2,149',
    features: ['All Essentials', 'Group Classes', '1-on-1 Monthly Consultation', 'Sauna & Recovery Lounge'],
    recommended: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '3,299',
    features: ['All Professional', 'Unlimited PT Sessions', 'Nutritional Coaching', 'Priority Booking']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author: 'Sarah Jenkins',
    role: 'Tech Executive',
    content: 'Dstars isn\'t just a gym; it\'s a performance lab. The minimal environment keeps me focused on the work.',
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    id: '2',
    author: 'David Chen',
    role: 'Professional Athlete',
    content: 'The level of professionalism and equipment quality is unmatched in the city. Truly a premium experience.',
    avatar: 'https://i.pravatar.cc/150?u=david'
  }
];

export const MOCK_MEMBERS = [
  { id: '1', name: 'Alexander Wright', email: 'alex@example.com', plan: 'Professional', status: 'Active', joined: 'Oct 12, 2023' },
  { id: '2', name: 'Sophia Loren', email: 'sophia@example.com', plan: 'Elite', status: 'Active', joined: 'Nov 05, 2023' },
  { id: '3', name: 'James Miller', email: 'james@example.com', plan: 'Essentials', status: 'Inactive', joined: 'Aug 22, 2023' },
  { id: '4', name: 'Isabella Garcia', email: 'isabella@example.com', plan: 'Professional', status: 'Active', joined: 'Dec 01, 2023' },
  { id: '5', name: 'Liam Wilson', email: 'liam@example.com', plan: 'Elite', status: 'Pending', joined: 'Jan 15, 2024' },
];

export const MOCK_SCHEDULE = [
  { id: '1', time: '08:00 AM', activity: 'Powerlifting Fundamentals', trainer: 'Marcus Thorne', capacity: '12/15' },
  { id: '2', time: '10:30 AM', activity: 'Metabolic Conditioning', trainer: 'Julian Ross', capacity: '18/20' },
  { id: '3', time: '04:00 PM', activity: 'Mobility & Flow', trainer: 'Elena Vance', capacity: '10/10' },
  { id: '4', time: '06:00 PM', activity: 'Elite Performance', trainer: 'Marcus Thorne', capacity: '08/15' },
];
