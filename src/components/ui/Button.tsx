import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'teal' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#22A555] hover:bg-[#1A7F3E] text-white',
    success: 'bg-[#22A555] hover:bg-[#1A7F3E] text-white',
    warning: 'bg-[#FDB912] hover:bg-[#E5A810] text-white',
    danger: 'bg-[#DC3545] hover:bg-[#C82333] text-white',
    teal: 'bg-[#20C997] hover:bg-[#1AB386] text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
