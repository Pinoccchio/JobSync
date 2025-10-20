import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  headerColor = 'bg-[#D4F4DD]'
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className={`${headerColor} px-6 py-3 font-semibold text-[#1A7F3E] uppercase text-sm`}>
          {title}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
