import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export type ConfirmationType = 'warning' | 'info' | 'success' | 'error' | 'question';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showCancel?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'question',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  showCancel = true
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmColor: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-200'
        };
      case 'info':
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'success':
        return {
          icon: CheckCircleIcon,
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          confirmColor: 'bg-green-600 hover:bg-green-700',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: XCircleIcon,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmColor: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-200'
        };
      case 'question':
      default:
        return {
          icon: QuestionMarkCircleIcon,
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
          confirmColor: 'bg-gray-600 hover:bg-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const { icon: Icon, iconColor, iconBg, confirmColor, borderColor } = getIconAndColors();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Card className={`w-full max-w-md transform transition-all duration-300 ${borderColor} border-2`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${iconBg}`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-muted-foreground text-base leading-relaxed">
            {message}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {showCancel && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-2 border-gray-200 hover:border-gray-300 min-w-[100px]"
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`${confirmColor} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[100px]`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for easy usage
export const useConfirmation = () => {
  const [confirmation, setConfirmation] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'question',
    onConfirm: () => {}
  });

  const showConfirmation = (config: {
    title: string;
    message: string;
    type?: ConfirmationType;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
  }) => {
    setConfirmation({
      isOpen: true,
      ...config
    });
  };

  const hideConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const ConfirmationComponent = () => (
    <ConfirmationModal
      isOpen={confirmation.isOpen}
      onClose={hideConfirmation}
      onConfirm={confirmation.onConfirm}
      title={confirmation.title}
      message={confirmation.message}
      type={confirmation.type}
      confirmText={confirmation.confirmText}
      cancelText={confirmation.cancelText}
      showCancel={confirmation.showCancel}
    />
  );

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationComponent
  };
};
