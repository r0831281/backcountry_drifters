interface CheckboxFilterProps {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function CheckboxFilter({ label, count, checked, onChange, id }: CheckboxFilterProps) {
  const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label
      htmlFor={checkboxId}
      className="flex items-center justify-between cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-forest-500 focus:ring-2 focus:ring-forest-500 focus:ring-offset-0 cursor-pointer transition-colors"
        />
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          {label}
        </span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-gray-400 font-medium">{count}</span>
      )}
    </label>
  );
}
