import type { AttendanceRecord, AttendanceSummary } from '../types';
import { getApiBaseUrl, getCookie, jsonHeaders, authHeaders, toPayload } from '../utils/api';

const parseAttendance = (attendance: AttendanceRecord): AttendanceRecord => ({
  ...attendance,
  id: Number(attendance.id),
  member_id: Number(attendance.member_id),
});

export interface AttendanceListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'present' | 'absent' | 'late' | 'cancelled';
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

interface AttendanceResourceResponse {
  data: AttendanceRecord;
}

export const fetchAdminAttendance = async (
  params: AttendanceListParams = {}
): Promise<PaginatedAttendanceResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
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
  attendance_date?: string;
  check_in_time?: string;
  status?: 'present' | 'late';
  source?: 'admin_manual' | 'qr_scan' | 'virtual_id' | 'kiosk';
  notes?: string;
  allow_duplicate?: boolean;
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

export const checkOutMemberAttendance = async (input: {
  member_id: number;
  attendance_date?: string;
  check_out_time?: string;
  notes?: string;
}): Promise<AttendanceRecord> => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(`${getApiBaseUrl()}/admin/api/attendance/check-out`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      ...jsonHeaders,
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
    body: JSON.stringify(input),
  });

  const payload = await toPayload<AttendanceResourceResponse>(response);
  return parseAttendance(payload.data);
};

export const markMemberAbsent = async (input: {
  member_id: number;
  attendance_date: string;
  source?: 'admin_manual' | 'qr_scan' | 'virtual_id' | 'kiosk';
  notes?: string;
  allow_override?: boolean;
}): Promise<AttendanceRecord> => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(`${getApiBaseUrl()}/admin/api/attendance/mark-absence`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...jsonHeaders,
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
    body: JSON.stringify(input),
  });

  const payload = await toPayload<AttendanceResourceResponse>(response);
  return parseAttendance(payload.data);
};

export const updateAttendanceRecord = async (
  id: number,
  input: {
    member_id?: number;
    attendance_date?: string;
    check_in_time?: string | null;
    check_out_time?: string | null;
    status?: 'present' | 'absent' | 'late' | 'cancelled';
    source?: 'admin_manual' | 'qr_scan' | 'virtual_id' | 'kiosk';
    notes?: string | null;
  }
): Promise<AttendanceRecord> => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(`${getApiBaseUrl()}/admin/api/attendance/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      ...jsonHeaders,
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
    body: JSON.stringify(input),
  });

  const payload = await toPayload<AttendanceResourceResponse>(response);
  return parseAttendance(payload.data);
};

export const deleteAttendanceRecord = async (id: number): Promise<void> => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(`${getApiBaseUrl()}/admin/api/attendance/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...jsonHeaders,
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
  });

  await toPayload(response);
};

export const fetchMemberAttendanceHistory = async (
  memberId: number,
  params: Pick<AttendanceListParams, 'status' | 'date_from' | 'date_to' | 'per_page' | 'page'> = {}
): Promise<PaginatedAttendanceResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.status) query.set('status', params.status);
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
