'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AosInit() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: false,
      easing: 'ease-out-cubic',
      offset: 50,
      delay: 50,
    });

    // Refresh AOS on dynamic page transitions / route updates
    const handleRefresh = () => {
      AOS.refresh();
    };

    window.addEventListener('load', handleRefresh);
    return () => {
      window.removeEventListener('load', handleRefresh);
    };
  }, []);

  return null;
}
