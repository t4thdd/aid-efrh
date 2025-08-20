import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X, Clock } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  duration?: number; // 0 means no auto-close
  persistent?: boolean;
  showProgress?: boolean;
  onClose: () => void;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

export default function NotificationToast({
  message,
  type,
  position = 'top-right',
  duration = 5000,
  persistent = false,
  showProgress = true,
  onClose,
  actionButton
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  
  // Handle closing animation and actual close
  const handleClose = useCallback(() => {
    setIsExiting(true); // Trigger exit animation
    // If not persistent, start auto-close timer
    if (!persistent && duration !== 0) {
      // Progress bar animation
      if (showProgress) {
        const interval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev - (100 / (duration / 100));
            return newProgress <= 0 ? 0 : newProgress;
          });
        }, 100);

        // Clear interval and timeout on unmount or re-render
        const timerId = setTimeout(() => {
          clearInterval(interval);
          onClose(); // Call actual onClose prop
        }, duration + 300); // Add 300ms for exit animation

        return () => {
          clearInterval(interval);
          clearTimeout(timerId);
        };
      }
    }
    // If persistent or duration is 0, just call onClose after exit animation
    setTimeout(() => {
      onClose();
    }, 300);
  }, [duration, onClose, persistent, showProgress]);

  useEffect(() => {
    // Show animation on mount
    setIsVisible(true);
    // Start auto-close timer if not persistent
    if (!persistent && duration !== 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose, persistent]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getClasses = () => {
    const baseClasses = 'fixed z-50 p-4 rounded-xl shadow-2xl border max-w-sm transition-all duration-300 backdrop-blur-sm';
    
    const positionClasses: { [key: string]: string } = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    }; // Positioning classes

    const typeClasses = {
      success: 'bg-green-50/95 border-green-200 text-green-800',
      error: 'bg-red-50/95 border-red-200 text-red-800',
      warning: 'bg-orange-50/95 border-orange-200 text-orange-800',
      info: 'bg-blue-50/95 border-blue-200 text-blue-800'
    };
    
    const animationClasses = isExiting 
      ? 'opacity-0 transform translate-x-full scale-95' 
      : isVisible 
      ? 'opacity-100 transform translate-x-0 scale-100' 
      : 'opacity-0 transform translate-x-full scale-95';
    
    return `${baseClasses} ${positionClasses[position]} ${typeClasses[type]} ${animationClasses}`;
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className={getClasses()} dir="rtl" role="alert" aria-live="polite">
      <div className="flex items-start space-x-3 space-x-reverse"> {/* Main content area */}
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-relaxed">{message}</p>

          {/* Action Button */}
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="mt-2 text-xs font-medium underline hover:no-underline transition-all duration-200"
            >
              {actionButton.text}
            </button>
          )}
        </div>

        {/* Close Button */}
        {!persistent && duration !== 0 && ( // Only show close button if not persistent and has a duration
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded transition-colors duration-200 hover:bg-white/50"
            aria-label="إغلاق الإشعار"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {showProgress && !persistent && (
        <div className="mt-3 w-full bg-gray-200/50 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}