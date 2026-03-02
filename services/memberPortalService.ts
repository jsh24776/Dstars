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
  status: 'active' | 'expired' | 'pending' | 'inactive';
  expirationDate: string | null;
  nextPaymentDue: string | null;
  remainingSessions: number | null;
  price?: number | null;
  billingCycle?: string | null;
  duration?: string | null;
  durationCount?: number | null;
  startDate?: string | null;
}

export interface MemberBillingItem {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'failed';
  receiptLabel: string;
  reference?: string | null;
  planName?: string | null;
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

interface MemberDashboardQuickStats {
  visitsThisMonth: number;
  visitsOverall: number;
  lastCheckInDate: string | null;
  lastPaymentAmount: number | null;
}

interface MemberDashboardPayload {
  plan: MemberPlanSummary;
  attendance: MemberAttendanceItem[];
  billing: MemberBillingItem[];
  quickStats: MemberDashboardQuickStats;
}

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

export const fetchMemberDashboard = async (token: string): Promise<MemberDashboardPayload> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/dashboard`, {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await readJson(response);
  const plan = (payload?.data?.plan ?? null) as MemberPlanSummary | null;
  const attendance = (payload?.data?.attendance ?? []) as MemberAttendanceItem[];
  const billing = (payload?.data?.billing ?? []) as MemberBillingItem[];
  const quickStats = (payload?.data?.quickStats ?? null) as MemberDashboardQuickStats | null;

  if (!plan) {
    throw new Error('Unable to load membership plan.');
  }

  return {
    plan,
    attendance,
    billing,
    quickStats: quickStats ?? {
      visitsThisMonth: 0,
      visitsOverall: 0,
      lastCheckInDate: null,
      lastPaymentAmount: null,
    },
  };
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

export const fetchMemberProfile = async (token: string): Promise<MemberProfile> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/profile`, {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await readJson(response);
  const profile = (payload?.data?.profile ?? null) as {
    full_name: string;
    email: string;
    phone: string;
  } | null;

  if (!profile) {
    throw new Error('Unable to load profile.');
  }

  return {
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone ?? '',
    address: '',
    emergencyContact: '',
  };
};

export const updateMemberProfile = async (
  token: string,
  input: { full_name: string; phone?: string | null }
): Promise<MemberProfile> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/profile`, {
    method: 'PATCH',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await readJson(response);
  const profile = (payload?.data?.profile ?? null) as {
    full_name: string;
    email: string;
    phone: string;
  } | null;

  if (!profile) {
    throw new Error('Unable to update profile.');
  }

  return {
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone ?? '',
    address: '',
    emergencyContact: '',
  };
};

export const updateMemberPassword = async (
  token: string,
  input: { current_password: string; new_password: string; new_password_confirmation: string }
): Promise<string> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/password`, {
    method: 'PATCH',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await readJson(response);
  return payload?.message ?? 'Password updated successfully.';
};

export const loadMemberPlanSummary = (email: string): MemberPlanSummary => {
  const requestRaw = window.localStorage.getItem(planRequestStorageKey(email));
  const hasPendingRequest = requestRaw === 'pending';

  return {
    name: 'Loading...',
    status: hasPendingRequest ? 'pending' : 'inactive',
    expirationDate: null,
    nextPaymentDue: null,
    remainingSessions: null,
  };
};

export const fetchMemberPlanSummaryFromApi = async (token: string): Promise<MemberPlanSummary> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/plan`, {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await readJson(response);
  const plan = (payload?.data?.plan ?? null) as MemberPlanSummary | null;
  if (!plan) {
    throw new Error('Unable to load membership plan.');
  }
  return plan;
};

export const submitMemberPlanChangeRequest = async (token: string, email: string): Promise<void> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/plan-change-request`, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  await readJson(response);
  window.localStorage.setItem(planRequestStorageKey(email.toLowerCase()), 'pending');
};

export interface ApplyMembershipResult {
  memberId: number;
  membershipId: string | null;
  downloadToken: string | null;
  invoiceId: number;
  invoiceNumber: string;
  invoiceTotalAmount: number;
  invoicePlanName: string;
}

export const applyMemberMembership = async (token: string, planId: number): Promise<ApplyMembershipResult> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/apply-membership`, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan_id: planId }),
  });

  const payload = await readJson(response);
  const member = payload?.data?.member ?? null;
  const invoice = payload?.data?.invoice ?? null;
  const downloadToken = payload?.data?.download_token ?? null;

  if (!member?.id || !invoice?.id) {
    throw new Error('Unable to apply membership.');
  }

  return {
    memberId: member.id as number,
    membershipId: (member.membership_id as string | null) ?? null,
    downloadToken: (downloadToken as string | null) ?? null,
    invoiceId: invoice.id as number,
    invoiceNumber: String(invoice.invoice_number ?? ''),
    invoiceTotalAmount: Number(invoice.total_amount ?? 0),
    invoicePlanName: String(invoice.plan_name ?? ''),
  };
};

export interface RecordMemberPaymentResult {
  paymentReference: string;
  paidAt: string | null;
  method: string;
  amountPaid: number;
}

export const recordMemberPayment = async (
  token: string,
  input: { invoice_id: number; member_id: number; payment_method: 'gcash' | 'maya' },
): Promise<RecordMemberPaymentResult> => {
  const response = await fetch(`${getApiBaseUrl()}/api/payments/record`, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await readJson(response);
  const payment = payload?.data?.payment ?? null;

  if (!payment?.id) {
    throw new Error('Unable to record payment.');
  }

  return {
    paymentReference: String(payment.payment_reference ?? ''),
    paidAt: payment.paid_at ?? null,
    method: String(payment.payment_method ?? ''),
    amountPaid: Number(payment.amount_paid ?? 0),
  };
};

export const loadMemberBilling = (): MemberBillingItem[] => {
  // fallback placeholder while real data loads
  return [];
};

export const fetchMemberBillingFromApi = async (token: string): Promise<MemberBillingItem[]> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/billing`, {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await readJson(response);
  const items = (payload?.data?.items ?? []) as MemberBillingItem[];
  return items;
};

export const loadMemberAttendance = (): MemberAttendanceItem[] => {
  // fallback placeholder while real data loads
  return [];
};

export const fetchMemberAttendanceFromApi = async (token: string): Promise<MemberAttendanceItem[]> => {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/member/attendance`, {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await readJson(response);
  const items = (payload?.data?.items ?? []) as MemberAttendanceItem[];
  return items;
};
