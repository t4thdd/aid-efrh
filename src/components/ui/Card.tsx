import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  border?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  border = true,
  variant = 'default',
  shadow = 'sm'
}) => {
  const baseClasses = 'bg-white rounded-xl';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const variantClasses = {
    default: '',
    elevated: 'transform hover:scale-105',
    outlined: 'border-2'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const borderClasses = border ? 'border border-gray-100' : '';

  return (
    <div className={`${baseClasses} ${paddingClasses[padding]} ${variantClasses[variant]} ${shadowClasses[shadow]} ${hoverClasses} ${borderClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;