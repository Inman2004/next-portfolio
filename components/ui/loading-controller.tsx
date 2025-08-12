'use client';

import { useEffect } from 'react';
import { useLoadingState } from '@/hooks/useLoadingState';
import { ProgressBar } from './progress-bar';

interface LoadingControllerProps {
  isLoading?: boolean;
}

export function LoadingController({ isLoading: externalLoading }: LoadingControllerProps) {
  const { isLoading: contextLoading, startLoading, stopLoading } = useLoadingState();
  
  // Sync external loading state with context
  useEffect(() => {
    if (externalLoading === undefined) return;
    
    if (externalLoading) {
      startLoading();
      return () => stopLoading();
    }
  }, [externalLoading, startLoading, stopLoading]);
  
  // Use either the external loading state or the context loading state
  const isLoading = externalLoading !== undefined ? externalLoading : contextLoading;
  
  return <ProgressBar isLoading={isLoading} />;
}

// Utility component to trigger loading state
export function StartLoading() {
  const { startLoading } = useLoadingState();
  
  useEffect(() => {
    startLoading();
    return () => {}; // Don't stop loading when this component unmounts
  }, [startLoading]);
  
  return null;
}

// Utility component to stop loading state
export function StopLoading() {
  const { stopLoading } = useLoadingState();
  
  useEffect(() => {
    stopLoading();
  }, [stopLoading]);
  
  return null;
}
