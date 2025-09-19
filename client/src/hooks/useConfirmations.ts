import { useConfirmation } from './useConfirmation';

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
