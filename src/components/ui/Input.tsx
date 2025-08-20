import React, { forwardRef } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

export interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'textarea';
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  error?: string;
  success?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  className?: string;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  icon: Icon,
  iconPosition = 'left',
  error,
  success,
  helpText,
  required = false,
  disabled = false,
  readOnly = false,
  rows = 3,
  className = '',
  inputClassName = ''
}, ref) => {
  const baseInputClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  
  const stateClasses = error 
    ? 'border-red-300 bg-red-50' 
    : success 
    ? 'border-green-300 bg-green-50'
    : 'border-gray-300 bg-white hover:border-gray-400';

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const readOnlyClasses = readOnly ? 'bg-gray-50' : '';

  const iconClasses = Icon ? (iconPosition === 'right' ? 'pr-10' : 'pl-10') : '';

  const inputClasses = `${baseInputClasses} ${stateClasses} ${disabledClasses} ${readOnlyClasses} ${iconClasses} ${inputClassName}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          className={inputClasses}
        />
      );
    }

    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={inputClasses}
      />
    );
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {renderInput()}
        
        {Icon && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${
            iconPosition === 'right' ? 'right-3' : 'left-3'
          }`}>
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {success && !error && (
        <p className="mt-2 text-sm text-green-600">{success}</p>
      )}
      
      {helpText && !error && !success && (
        <p className="mt-2 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;