'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const WelcomePopup = dynamic(() => import('./WelcomePopup').then(mod => ({ default: mod.default })), { ssr: false });

export default function WelcomePopupClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <WelcomePopup />;
}
