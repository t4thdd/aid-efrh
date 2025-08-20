import React, { forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  success?: string;
  helpText?: string;
  layout?: 'vertical' | 'horizontal';
  className?: string;
  labelWidth?: string;
  showOptional?: boolean;
  tooltip?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(({
  children,
  label,
  required = false,
  error,
  success,
  helpText,
  layout = 'vertical',
  className = '',
  labelWidth = 'w-1/3',
  showOptional = true,
  tooltip
}: FormFieldProps, ref) => {
  const isHorizontal = layout === 'horizontal';

  const renderLabel = () => {
    if (!label) return null;

    return (
      <label className={`block text-sm font-medium text-gray-700 ${isHorizontal ? `${labelWidth} flex-shrink-0` : 'mb-2'}`}>
        <span className="flex items-center space-x-1 space-x-reverse">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
          {!required && showOptional && (
            <span className="text-gray-400 text-xs">(اختياري)</span>
          )}
          {tooltip && (
            <div className="relative group">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </span>
      </label>
    );
  };

  const renderMessages = () => (
    <div className="mt-2 space-y-1">
      {error && (
        <p className="text-red-600 text-sm flex items-center animate-shake">
          <AlertTriangle className="w-4 h-4 ml-1 flex-shrink-0" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-green-600 text-sm flex items-center animate-fadeIn">
          <CheckCircle className="w-4 h-4 ml-1 flex-shrink-0" />
          {success}
        </p>
      )}
      
      {helpText && !error && !success && (
        <p className="text-gray-500 text-sm flex items-center">
          <Info className="w-4 h-4 ml-1 flex-shrink-0" />
          {helpText}
        </p>
      )}
    </div>
  );

  if (isHorizontal) {
    return (
      <div ref={ref} className={`flex items-start space-x-4 space-x-reverse ${className}`}>
        {renderLabel()}
        <div className="flex-1">
          {children}
          {renderMessages()}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {renderLabel()}
      {children}
      {renderMessages()}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;