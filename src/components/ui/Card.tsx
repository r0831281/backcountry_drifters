import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseClasses = [
    'bg-white rounded-xl shadow-soft p-6',
    'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
  ].join(' ');
  const hoverClass = hover
    ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer'
    : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  const classes = `${baseClasses} ${hoverClass} ${clickableClass} ${className}`.trim();

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`.trim()}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className = '', as: Tag = 'h3' }: CardTitleProps) {
  return (
    <Tag className={`text-xl font-semibold text-forest-700 ${className}`.trim()}>
      {children}
    </Tag>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`text-gray-700 ${className}`.trim()}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`.trim()}>
      {children}
    </div>
  );
}
