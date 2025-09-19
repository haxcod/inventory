import { useState } from 'react';
import { XMarkIcon, QrCodeIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface QRMachineProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function QRMachine({ isOpen, onClose, onScan }: QRMachineProps) {
  const [machineInput, setMachineInput] = useState('');

  const handleMachineScan = () => {
    if (machineInput.trim()) {
      onScan(machineInput.trim());
      setMachineInput('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMachineScan();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-lg p-4">
      <div className="relative bg-card rounded-lg shadow-xl w-full max-w-md p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <ComputerDesktopIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Machine QR Scanner</h2>
          <p className="text-sm text-muted-foreground">
            Enter QR code manually or connect external scanner
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              QR Code / Product ID
            </label>
            <input
              type="text"
              value={machineInput}
              onChange={(e) => setMachineInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter QR code, product ID, or scan with external scanner..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center font-mono text-lg"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleMachineScan}
              disabled={!machineInput.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <QrCodeIcon className="h-4 w-4 mr-2" />
              Process Code
            </Button>
            <Button
              variant="outline"
              onClick={() => setMachineInput('')}
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Supported Input Methods:
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Manual typing</li>
            <li>• External barcode scanner</li>
            <li>• Copy & paste from clipboard</li>
            <li>• USB/Bluetooth scanner devices</li>
          </ul>
        </div>

        <Button onClick={onClose} className="mt-4 w-full" variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}
