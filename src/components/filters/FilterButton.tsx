interface FilterButtonProps {
  activeCount: number;
  onClick: () => void;
}

export function FilterButton({ activeCount, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 hover:border-forest-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
      aria-label={`Open filters${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
    >
      <svg
        className="w-5 h-5 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <span>Filter</span>
      {activeCount > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-trout-gold text-white text-xs font-semibold"
          aria-hidden="true"
        >
          {activeCount}
        </span>
      )}
    </button>
  );
}
