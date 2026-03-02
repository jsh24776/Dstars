import React, { useEffect, useState } from 'react';
import MemberDashboard from './MemberDashboard';
import type {
  MemberAttendanceItem,
  MemberBillingItem,
  MemberPlanSummary,
} from '../../services/memberPortalService';
import { fetchMemberDashboard } from '../../services/memberPortalService';

interface MemberDashboardContainerProps {
  token: string;
  fallbackPlan: MemberPlanSummary;
  fallbackAttendance: MemberAttendanceItem[];
}

const MemberDashboardContainer: React.FC<MemberDashboardContainerProps> = ({
  token,
  fallbackPlan,
  fallbackAttendance,
}) => {
  const [plan, setPlan] = useState<MemberPlanSummary>(fallbackPlan);
  const [attendance, setAttendance] = useState<MemberAttendanceItem[]>(fallbackAttendance);
  const [billing, setBilling] = useState<MemberBillingItem[]>([]);
  const [visitsThisMonth, setVisitsThisMonth] = useState<number>(0);
  const [visitsOverall, setVisitsOverall] = useState<number>(0);
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
  const [lastPaymentAmount, setLastPaymentAmount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await fetchMemberDashboard(token);
        if (!isMounted) return;
        setPlan(data.plan);
        setAttendance(data.attendance);
        setBilling(data.billing);
        setVisitsThisMonth(data.quickStats.visitsThisMonth);
        setVisitsOverall(data.quickStats.visitsOverall);
        setLastCheckInDate(data.quickStats.lastCheckInDate);
        setLastPaymentAmount(data.quickStats.lastPaymentAmount);
      } catch {
        // Keep showing fallback data on error.
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <MemberDashboard
      plan={plan}
      attendance={attendance}
      billing={billing}
      visitsThisMonth={visitsThisMonth}
      visitsOverall={visitsOverall}
      lastCheckInDate={lastCheckInDate}
      lastPaymentAmount={lastPaymentAmount}
    />
  );
};

export default MemberDashboardContainer;

