import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationModal, ConfirmationType } from '../components/ui/ConfirmationModal';

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

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

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

// Utility functions for common confirmations
export const useConfirmations = () => {
  const { showConfirmation } = useConfirmation();

  const confirmDelete = (itemName: string, onConfirm: () => void) => {
    showConfirmation({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm
    });
  };

  const confirmSave = (onConfirm: () => void) => {
    showConfirmation({
      title: 'Save Changes',
      message: 'Are you sure you want to save these changes?',
      type: 'question',
      confirmText: 'Save',
      cancelText: 'Cancel',
      onConfirm
    });
  };

  const confirmDiscard = (onConfirm: () => void) => {
    showConfirmation({
      title: 'Discard Changes',
      message: 'Are you sure you want to discard your changes? This action cannot be undone.',
      type: 'warning',
      confirmText: 'Discard',
      cancelText: 'Cancel',
      onConfirm
    });
  };

  const showSuccess = (message: string) => {
    showConfirmation({
      title: 'Success',
      message,
      type: 'success',
      confirmText: 'OK',
      showCancel: false,
      onConfirm: () => {}
    });
  };

  const showError = (message: string) => {
    showConfirmation({
      title: 'Error',
      message,
      type: 'error',
      confirmText: 'OK',
      showCancel: false,
      onConfirm: () => {}
    });
  };

  const showInfo = (title: string, message: string) => {
    showConfirmation({
      title,
      message,
      type: 'info',
      confirmText: 'OK',
      showCancel: false,
      onConfirm: () => {}
    });
  };

  return {
    confirmDelete,
    confirmSave,
    confirmDiscard,
    showSuccess,
    showError,
    showInfo,
    showConfirmation
  };
};
