'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/common/Loading';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/boards');
    } else {
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecking(false);
  }, [router]);

  if (checking) return <Loading />;
  return null;
}