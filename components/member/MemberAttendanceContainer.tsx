import React, { useEffect, useState } from 'react';
import MemberAttendance from './MemberAttendance';
import type { MemberAttendanceItem } from '../../services/memberPortalService';
import { fetchMemberAttendanceFromApi } from '../../services/memberPortalService';

interface MemberAttendanceContainerProps {
  token: string;
  fallbackItems: MemberAttendanceItem[];
}

const MemberAttendanceContainer: React.FC<MemberAttendanceContainerProps> = ({ token, fallbackItems }) => {
  const [items, setItems] = useState<MemberAttendanceItem[]>(fallbackItems);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const freshItems = await fetchMemberAttendanceFromApi(token);
        if (!isMounted) return;
        setItems(freshItems);
      } catch {
        // keep fallback on error
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return <MemberAttendance items={items} />;
};

export default MemberAttendanceContainer;

