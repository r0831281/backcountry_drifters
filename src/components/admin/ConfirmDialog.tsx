import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** Visual variant for the confirm button. Defaults to destructive red. */
  variant?: 'danger' | 'warning';
}

/**
 * A reusable confirmation dialog for destructive or important actions.
 * Uses the existing Modal component for consistent UX.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  const iconColor = variant === 'danger' ? 'text-red-500' : 'text-amber-500';
  const iconBg = variant === 'danger' ? 'bg-red-50' : 'bg-amber-50';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
          {variant === 'danger' ? (
            <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">{message}</p>
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`
            inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
            ${variant === 'danger'
              ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
              : 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            confirmLabel
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}
