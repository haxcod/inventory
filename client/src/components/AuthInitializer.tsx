import { useEffect } from 'react';
import { useAuth } from '../hooks/useStores';

export function AuthInitializer() {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return null; // This component doesn't render anything
}
