import type { AttendanceRecord, AttendanceSummary } from '../types';

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

const parseAttendance = (attendance: AttendanceRecord): AttendanceRecord => ({
  ...attendance,
  id: Number(attendance.id),
  member_id: Number(attendance.member_id),
});

export interface AttendanceListParams {
  page?: number;
  per_page?: number;
  search?: string;
  member_id?: number;
  date_from?: string;
  date_to?: string;
}

interface PaginatedAttendanceResponse {
  data: AttendanceRecord[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface AttendanceSummaryResponse {
  data: AttendanceSummary;
}

export const fetchAdminAttendance = async (
  params: AttendanceListParams = {}
): Promise<PaginatedAttendanceResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.search) query.set('search', params.search);
  if (params.member_id) query.set('member_id', String(params.member_id));
  if (params.date_from) query.set('date_from', params.date_from);
  if (params.date_to) query.set('date_to', params.date_to);

  const response = await fetch(`${getApiBaseUrl()}/admin/api/attendance?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: jsonHeaders,
  });

  const payload = await toPayload<PaginatedAttendanceResponse>(response);
  return {
    ...payload,
    data: payload.data.map(parseAttendance),
  };
};

export const fetchAdminAttendanceSummary = async (
  fromDate?: string,
  toDate?: string
): Promise<AttendanceSummary> => {
  const query = new URLSearchParams();
  if (fromDate) query.set('from_date', fromDate);
  if (toDate) query.set('to_date', toDate);

  const response = await fetch(`${getApiBaseUrl()}/admin/api/attendance/summary?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: jsonHeaders,
  });

  const payload = await toPayload<AttendanceSummaryResponse>(response);
  return payload.data;
};

export const checkInMemberAttendance = async (input: {
  member_id: number;
  check_in_time?: string;
}): Promise<AttendanceRecord> => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(`${getApiBaseUrl()}/admin/api/attendance/check-in`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...jsonHeaders,
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
    body: JSON.stringify(input),
  });

  const payload = await toPayload<{ data: AttendanceRecord }>(response);
  return parseAttendance(payload.data);
};

export const fetchMemberAttendanceHistory = async (
  memberId: number,
  params: Pick<AttendanceListParams, 'date_from' | 'date_to' | 'per_page' | 'page'> = {}
): Promise<PaginatedAttendanceResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.date_from) query.set('date_from', params.date_from);
  if (params.date_to) query.set('date_to', params.date_to);

  const response = await fetch(`${getApiBaseUrl()}/admin/api/attendance/${memberId}?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: jsonHeaders,
  });

  const payload = await toPayload<PaginatedAttendanceResponse>(response);
  return {
    ...payload,
    data: payload.data.map(parseAttendance),
  };
};
