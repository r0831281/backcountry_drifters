import { type ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageContainer({ children, className = '', fullWidth = false }: PageContainerProps) {
  const containerClass = fullWidth ? 'w-full' : 'container-custom';

  return (
    <main id="main-content" className={`min-h-screen animate-fade-in pb-8 md:pb-12 ${className}`.trim()}>
      <div className={containerClass}>
        {children}
      </div>
    </main>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`py-10 md:py-14 ${className}`.trim()}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-forest-700 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-500 text-lg max-w-2xl">
              {subtitle}
            </p>
          )}
          {/* Gold accent underline */}
          <div className="mt-4 w-16 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageSectionProps {
  children: ReactNode;
  className?: string;
}

export function PageSection({ children, className = '' }: PageSectionProps) {
  return (
    <section className={`section ${className}`.trim()}>
      {children}
    </section>
  );
}
