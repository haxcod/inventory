import { useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Simulate QR code detection (in real implementation, you'd use a QR library)
      setTimeout(() => {
        // Mock QR code result for demonstration
        const mockQRResult = 'PRODUCT_12345';
        onScan(mockQRResult);
        onClose();
      }, 3000);

    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  }, [onScan, onClose]);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, startScanning]);

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
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
            <CameraIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Camera QR Scanner</h2>
          <p className="text-sm text-muted-foreground">
            Use your device camera to scan QR codes
          </p>
        </div>

        <div className="relative mb-6">
          <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            {isScanning ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                playsInline
                muted
              />
            ) : (
              <div className="text-center">
                <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Camera not available</p>
              </div>
            )}
          </div>

          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-blue-500 rounded-lg animate-pulse">
                <div className="w-full h-full border-2 border-white rounded-lg"></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mb-4">
          <Button
            onClick={startScanning}
            disabled={isScanning}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            {isScanning ? 'Scanning...' : 'Start Camera'}
          </Button>
          <Button
            variant="outline"
            onClick={stopScanning}
            disabled={!isScanning}
            className="flex-1"
          >
            Stop
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mb-4">
          Position the QR code within the frame to scan
        </p>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg mb-4">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button onClick={onClose} className="w-full" variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}
