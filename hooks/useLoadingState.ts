'use client';

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import React from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useLoadingState = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStack, setLoadingStack] = useState<number>(0);

  const startLoading = useCallback(() => {
    setLoadingStack((prev) => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingStack((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    setIsLoading(loadingStack > 0);
  }, [loadingStack]);

  // Use createElement instead of JSX
  return React.createElement(
    LoadingContext.Provider,
    { value: { isLoading, startLoading, stopLoading } },
    children
  );
}

// Custom hook for wrapping async operations with loading state
export function useAsyncLoading() {
  const { startLoading, stopLoading } = useLoadingState();

  const wrapAsync = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        startLoading();
        return await asyncFn();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return { wrapAsync };
}