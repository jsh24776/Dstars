
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

export interface AttendanceRecord {
  id: number;
  member_id: number;
  check_in_date: string;
  check_in_time: string | null;
  member?: {
    id: number;
    full_name: string;
    email: string;
    membership_id: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceSummary {
  range: {
    from_date: string;
    to_date: string;
  };
  today_total_check_ins: number;
  total_active_members: number;
  total_expired_members: number;
  members_expiring_in_3_days: number;
  today_check_ins: AttendanceRecord[];
  most_active_members: Array<{
    member_id: number;
    full_name: string;
    membership_id: string;
    total_check_ins: number;
  }>;
  attendance_trends: Array<{
    date: string;
    total_check_ins: number;
  }>;
}
