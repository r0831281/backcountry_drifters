interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  label?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  label = 'Date Range',
}: DateRangeFilterProps) {
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value ? new Date(value) : null, endDate);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(startDate, value ? new Date(value) : null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Start date */}
        <div className="relative">
          <label htmlFor="start-date" className="sr-only">
            Start date
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <input
            type="date"
            id="start-date"
            value={formatDateForInput(startDate)}
            onChange={handleStartChange}
            className="block w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 focus:outline-none transition-colors"
            placeholder="Start date"
          />
        </div>

        {/* End date */}
        <div className="relative">
          <label htmlFor="end-date" className="sr-only">
            End date
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <input
            type="date"
            id="end-date"
            value={formatDateForInput(endDate)}
            onChange={handleEndChange}
            min={formatDateForInput(startDate)}
            className="block w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 focus:outline-none transition-colors"
            placeholder="End date"
          />
        </div>
      </div>
    </div>
  );
}
