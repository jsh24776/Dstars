/**
 * Shared API utilities — base URL, CSRF cookie, common headers, response parsing.
 */

export const getApiBaseUrl = (): string =>
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const getCookie = (name: string): string => {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[2]) : '';
};

export const jsonHeaders: HeadersInit = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
};

export const authHeaders = (): HeadersInit => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    return {
        ...jsonHeaders,
        'Content-Type': 'application/json',
        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    };
};

export const toPayload = async <T>(response: Response): Promise<T> => {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error((payload as { message?: string })?.message ?? 'Request failed.');
    }
    return payload as T;
};

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
