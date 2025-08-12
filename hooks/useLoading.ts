'use client';

import { useState, useCallback } from 'react';
import { useLoadingState } from './useLoadingState';

export function useLoading() {
  const [localLoading, setLocalLoading] = useState(false);
  const { startLoading, stopLoading } = useLoadingState();
  
  const startLoadingWithLocal = useCallback(() => {
    setLocalLoading(true);
    startLoading();
  }, [startLoading]);
  
  const stopLoadingWithLocal = useCallback(() => {
    setLocalLoading(false);
    stopLoading();
  }, [stopLoading]);
  
  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        startLoadingWithLocal();
        return await fn();
      } finally {
        stopLoadingWithLocal();
      }
    },
    [startLoadingWithLocal, stopLoadingWithLocal]
  );
  
  return {
    isLoading: localLoading,
    startLoading: startLoadingWithLocal,
    stopLoading: stopLoadingWithLocal,
    withLoading,
  };
}
