export interface MemberUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface MemberSession {
  user: MemberUser;
  token: string;
}

export interface MemberPlanSummary {
  name: string;
  status: 'active' | 'expired' | 'pending';
  expirationDate: string | null;
  nextPaymentDue: string | null;
  remainingSessions: number | null;
}

export interface MemberBillingItem {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'failed';
  receiptLabel: string;
}

export interface MemberAttendanceItem {
  id: string;
  date: string;
  timeIn: string;
}

export interface MemberProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
}

const MEMBER_SESSION_KEY = 'member_portal_session';

const getApiBaseUrl = () => (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

const jsonHeaders: HeadersInit = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const readJson = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message ?? 'Request failed.');
  }
  return payload;
};

export const loadMemberSession = (): MemberSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(MEMBER_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as MemberSession;
    if (!parsed?.token || !parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveMemberSession = (session: MemberSession) => {
  window.localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));
};

export const clearMemberSession = () => {
  window.localStorage.removeItem(MEMBER_SESSION_KEY);
};

export const loginMember = async (email: string, password: string): Promise<MemberSession> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });

  const payload = await readJson(response);
  const session: MemberSession = {
    token: payload?.data?.token ?? '',
    user: payload?.data?.user,
  };

  if (!session.token || !session.user?.email) {
    throw new Error('Invalid login response.');
  }

  saveMemberSession(session);
  return session;
};

export const fetchMemberMe = async (token: string): Promise<MemberUser> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/me`, {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await readJson(response);
  return payload?.data?.user;
};

export const logoutMember = async (token: string) => {
  try {
    await fetch(`${getApiBaseUrl()}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${token}`,
      },
    });
  } finally {
    clearMemberSession();
  }
};

export const requestMemberPasswordReset = async (
  email: string
): Promise<{ message: string; debugCode?: string | null }> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });

  const payload = await readJson(response);
  return {
    message: payload?.message ?? 'If the account exists, a reset code has been sent.',
    debugCode: payload?.data?.debug_code ?? null,
  };
};

export const resetMemberPassword = async (input: {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}): Promise<string> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });

  const payload = await readJson(response);
  return payload?.message ?? 'Password reset successfully.';
};

const profileStorageKey = (email: string) => `member_profile_${email.toLowerCase()}`;
const planRequestStorageKey = (email: string) => `member_plan_request_${email.toLowerCase()}`;

export const loadMemberProfile = (user: MemberUser): MemberProfile => {
  const raw = window.localStorage.getItem(profileStorageKey(user.email));
  if (raw) {
    try {
      return JSON.parse(raw) as MemberProfile;
    } catch {
      // fall through to default profile.
    }
  }

  return {
    fullName: user.name ?? '',
    email: user.email ?? '',
    phone: '',
    address: '',
    emergencyContact: '',
  };
};

export const saveMemberProfile = (email: string, profile: MemberProfile) => {
  window.localStorage.setItem(profileStorageKey(email), JSON.stringify(profile));
};

export const loadMemberPlanSummary = (email: string): MemberPlanSummary => {
  const requestRaw = window.localStorage.getItem(planRequestStorageKey(email));
  const hasPendingRequest = requestRaw === 'pending';

  return {
    name: 'Professional Plan',
    status: hasPendingRequest ? 'pending' : 'active',
    expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(),
    nextPaymentDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    remainingSessions: 8,
  };
};

export const submitPlanChangeRequest = (email: string) => {
  window.localStorage.setItem(planRequestStorageKey(email.toLowerCase()), 'pending');
};

export const loadMemberBilling = (): MemberBillingItem[] => {
  return [
    {
      id: 'INV-2026-021',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31).toISOString(),
      amount: 2299,
      method: 'GCash',
      status: 'paid',
      receiptLabel: 'Receipt-Feb',
    },
    {
      id: 'INV-2026-020',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 62).toISOString(),
      amount: 2299,
      method: 'Card',
      status: 'paid',
      receiptLabel: 'Receipt-Jan',
    },
  ];
};

export const loadMemberAttendance = (): MemberAttendanceItem[] => {
  return [
    {
      id: 'CHK-1001',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      timeIn: '06:12 PM',
    },
    {
      id: 'CHK-1002',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      timeIn: '05:44 PM',
    },
    {
      id: 'CHK-1003',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      timeIn: '07:03 PM',
    },
  ];
};
