import type { MembershipPlan } from '../types';

const getApiBaseUrl = () => (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : '';
};

const jsonHeaders: HeadersInit = {
  Accept: 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

const toPayload = async <T>(response: Response): Promise<T> => {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message ?? 'Request failed.');
  }

  return payload as T;
};

const parsePlan = (plan: MembershipPlan): MembershipPlan => ({
  ...plan,
  price: Number(plan.price ?? 0),
  duration_count: Number(plan.duration_count ?? 1),
  features: Array.isArray(plan.features) ? plan.features : [],
});

interface PublicPlansResponse {
  data?: {
    plans?: MembershipPlan[] | { data?: MembershipPlan[] };
  };
}

interface PaginatedAdminPlanResponse {
  data: MembershipPlan[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AdminPlanListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'active' | 'inactive';
}

export interface MembershipPlanInput {
  name: string;
  duration: 'day' | 'week' | 'month' | 'year';
  duration_count: number;
  price: number;
  status: 'active' | 'inactive';
  description?: string;
  features?: string[];
}

export const fetchPublicMembershipPlans = async (): Promise<MembershipPlan[]> => {
  const response = await fetch(`${getApiBaseUrl()}/api/membership-plans`, {
    method: 'GET',
    headers: jsonHeaders,
  });

  const payload = await toPayload<PublicPlansResponse>(response);
  const plansRaw = payload?.data?.plans ?? [];
  const plans = Array.isArray(plansRaw) ? plansRaw : plansRaw?.data ?? [];

  return plans.map(parsePlan);
};

export const fetchAdminMembershipPlans = async (
  params: AdminPlanListParams = {}
): Promise<PaginatedAdminPlanResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);

  const response = await fetch(`${getApiBaseUrl()}/admin/api/membership-plans?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: jsonHeaders,
  });

  const payload = await toPayload<PaginatedAdminPlanResponse>(response);

  return {
    ...payload,
    data: payload.data.map(parsePlan),
  };
};

export const createAdminMembershipPlan = async (input: MembershipPlanInput): Promise<MembershipPlan> => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(`${getApiBaseUrl()}/admin/api/membership-plans`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...jsonHeaders,
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
    body: JSON.stringify(input),
  });

  const payload = await toPayload<{ data: MembershipPlan }>(response);
  return parsePlan(payload.data);
};

export const updateAdminMembershipPlan = async (
  id: number,
  input: Partial<MembershipPlanInput>
): Promise<MembershipPlan> => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(`${getApiBaseUrl()}/admin/api/membership-plans/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      ...jsonHeaders,
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
    body: JSON.stringify(input),
  });

  const payload = await toPayload<{ data: MembershipPlan }>(response);
  return parsePlan(payload.data);
};

export const updateAdminMembershipPlanStatus = async (
  id: number,
  status: 'active' | 'inactive'
): Promise<MembershipPlan> => {
  return updateAdminMembershipPlan(id, { status });
};

export const deleteAdminMembershipPlan = async (id: number): Promise<void> => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(`${getApiBaseUrl()}/admin/api/membership-plans/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...jsonHeaders,
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
    body: JSON.stringify({ confirm: true }),
  });

  await toPayload(response);
};
