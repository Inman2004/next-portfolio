'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function PerformanceMonitor() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }
    
    // You can also send these metrics to an analytics service
    // For example:
    // analytics.track(metric.name, metric);
  });

  return null;
}
