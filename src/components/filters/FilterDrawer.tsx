import { useEffect } from 'react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FilterDrawer({ isOpen, onClose, children }: FilterDrawerProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter options"
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto transform transition-transform duration-300 ease-out"
        style={{
          animation: isOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out',
        }}
      >
        {/* Drawer handle */}
        <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-white border-b border-gray-200">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="sticky top-11 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-forest-700">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">{children}</div>

        {/* Apply button (sticky) */}
        <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg bg-forest-500 text-white font-medium hover:bg-forest-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .filter-drawer {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
