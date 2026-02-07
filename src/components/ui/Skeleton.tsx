import { type CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  style?: CSSProperties;
}

export function Skeleton({ className = '', width, height, rounded = true, style }: SkeletonProps) {
  const roundedClass = rounded ? 'rounded-md' : '';
  const inlineStyle: CSSProperties = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <div
      className={`skeleton ${roundedClass} ${className}`.trim()}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 space-y-4">
      <Skeleton
        className="h-40 w-full"
        style={{
          width: 'calc(100% + 3rem)',
          marginLeft: '-1.5rem',
          marginTop: '-1.5rem',
          borderRadius: '0.75rem 0.75rem 0 0',
        }}
      />
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3.5 w-1/4" />
        <Skeleton className="h-3.5 w-2/5" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}
