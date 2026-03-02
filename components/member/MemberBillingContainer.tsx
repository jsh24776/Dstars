import React, { useEffect, useState } from 'react';
import MemberBilling from './MemberBilling';
import type { MemberBillingItem } from '../../services/memberPortalService';
import { fetchMemberBillingFromApi } from '../../services/memberPortalService';

interface MemberBillingContainerProps {
  token: string;
  fallbackItems: MemberBillingItem[];
}

const MemberBillingContainer: React.FC<MemberBillingContainerProps> = ({ token, fallbackItems }) => {
  const [items, setItems] = useState<MemberBillingItem[]>(fallbackItems);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const freshItems = await fetchMemberBillingFromApi(token);
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

  return <MemberBilling items={items} />;
};

export default MemberBillingContainer;

