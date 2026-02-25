export type DashboardTabId = 'dashboard' | 'members' | 'plans' | 'invoices' | 'payments' | 'attendance';
export type DashboardDeepLinkKind = 'member' | 'invoice' | 'payment' | 'plan';

export interface DashboardDeepLink {
  tab: DashboardTabId;
  kind: DashboardDeepLinkKind;
  id: number;
  created_at: number;
}

const STORAGE_KEY = 'dashboard_deep_link';
const EVENT_NAME = 'dashboard:deeplink';

const isValid = (value: any): value is DashboardDeepLink => {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.tab === 'string' &&
    typeof value.kind === 'string' &&
    Number.isInteger(value.id) &&
    typeof value.created_at === 'number'
  );
};

export const setDashboardDeepLink = (payload: Omit<DashboardDeepLink, 'created_at'>) => {
  const link: DashboardDeepLink = {
    ...payload,
    created_at: Date.now(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(link));
  window.dispatchEvent(new CustomEvent<DashboardDeepLink>(EVENT_NAME, { detail: link }));
};

export const consumeDashboardDeepLink = (
  tab: DashboardTabId,
  kind?: DashboardDeepLinkKind
): DashboardDeepLink | null => {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (parsed.tab !== tab) return null;
    if (kind && parsed.kind !== kind) return null;

    sessionStorage.removeItem(STORAGE_KEY);
    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const onDashboardDeepLink = (handler: (link: DashboardDeepLink) => void) => {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<DashboardDeepLink>;
    const detail = customEvent.detail;
    if (isValid(detail)) {
      handler(detail);
    }
  };

  window.addEventListener(EVENT_NAME, listener as EventListener);
  return () => window.removeEventListener(EVENT_NAME, listener as EventListener);
};

