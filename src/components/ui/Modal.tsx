import { type ReactNode, useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * Tracks open/close lifecycle to allow CSS exit animations.
 * Returns `shouldRender` (mount/unmount) and `isAnimating` (CSS transition state).
 */
function useModalLifecycle(isOpen: boolean, exitDurationMs = 300) {
  const [phase, setPhase] = useState<'closed' | 'entering' | 'open' | 'exiting'>('closed');

  // This effect synchronizes animation phase state with the isOpen prop.
  // setState is intentional here to drive CSS transition lifecycle.
  useEffect(() => {
    if (isOpen) {
      setPhase('entering'); // eslint-disable-line react-hooks/set-state-in-effect
      const raf = requestAnimationFrame(() => setPhase('open'));
      return () => cancelAnimationFrame(raf);
    } else {
      setPhase((prev) => {
        if (prev === 'open' || prev === 'entering') return 'exiting';
        return 'closed';
      });
    }
  }, [isOpen]);

  // Finish the exit after the CSS transition completes
  useEffect(() => {
    if (phase !== 'exiting') return;
    const timer = setTimeout(() => setPhase('closed'), exitDurationMs);
    return () => clearTimeout(timer);
  }, [phase, exitDurationMs]);

  return useMemo(() => ({
    shouldRender: phase !== 'closed',
    isAnimating: phase === 'open',
  }), [phase]);
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  const { shouldRender, isAnimating } = useModalLifecycle(isOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Restore focus when modal fully closes
  useEffect(() => {
    if (!shouldRender) {
      previousActiveElement.current?.focus();
    }
  }, [shouldRender]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [shouldRender]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus the first focusable element
    firstFocusable?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const modalContent = (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center p-4
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'}
      `}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={contentRef}
        className={`
          bg-white rounded-2xl shadow-xl w-full ${maxWidthClasses[maxWidth]}
          max-h-[90vh] overflow-y-auto
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isAnimating
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-[0.98]'
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-forest-800"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="
                p-2 -m-2 rounded-full text-gray-400
                hover:text-gray-600 hover:bg-gray-100
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-trout-gold focus-visible:ring-offset-2
              "
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal at document body level using Portal
  return createPortal(modalContent, document.body);
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 ${className}`.trim()}>
      {children}
    </div>
  );
}
