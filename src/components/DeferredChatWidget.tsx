'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/**
 * ChatWidget'ı ana bundle'dan ayırır ve tarayıcı boşta kalınca (ya da
 * en geç 3 sn sonra) mount eder. İlk boyama (LCP/TBT) etkilenmez.
 */
const ChatWidget = dynamic(() => import('./ChatWidget/ChatWidget'), { ssr: false });

export default function DeferredChatWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as any;
    let handle: number;
    if (typeof w.requestIdleCallback === 'function') {
      handle = w.requestIdleCallback(() => setReady(true), { timeout: 3000 });
      return () => w.cancelIdleCallback?.(handle);
    }
    handle = window.setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(handle);
  }, []);

  return ready ? <ChatWidget /> : null;
}
