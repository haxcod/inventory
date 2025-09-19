/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { ConfirmationModal, type ConfirmationType } from '../components/ui/ConfirmationModal';

interface ConfirmationConfig {
  title: string;
  message: string;
  type?: ConfirmationType;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  isLoading?: boolean;
}

interface ConfirmationContextType {
  showConfirmation: (config: ConfirmationConfig) => void;
  hideConfirmation: () => void;
  setLoading: (loading: boolean) => void;
}

export const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);


interface ConfirmationProviderProps {
  children: ReactNode;
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'question',
    onConfirm: () => {},
    isLoading: false
  });

  const showConfirmation = (config: ConfirmationConfig) => {
    setConfirmation({
      isOpen: true,
      type: 'question',
      showCancel: true,
      isLoading: false,
      ...config
    });
  };

  const hideConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const setLoading = (loading: boolean) => {
    setConfirmation(prev => ({ ...prev, isLoading: loading }));
  };

  const handleConfirm = async () => {
    if (confirmation.isLoading) return;
    
    setLoading(true);
    try {
      await confirmation.onConfirm();
      hideConfirmation();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setLoading(false);
    }
  };

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation, setLoading }}>
      {children}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        type={confirmation.type}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        showCancel={confirmation.showCancel}
        isLoading={confirmation.isLoading}
      />
    </ConfirmationContext.Provider>
  );
};

// Export the hook from the same file
export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

