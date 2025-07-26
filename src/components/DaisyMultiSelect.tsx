import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectOption {
  id: string | number;
  name: string;
  description?: string;
}

interface DaisyMultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
}

const DaisyMultiSelect: React.FC<DaisyMultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = "",
  color = 'primary'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Convert both to strings for comparison to handle type mismatches
  const selectedOptions = options.filter(option => 
    selectedValues.map(v => String(v)).includes(String(option.id))
  );

  const handleToggleOption = (optionId: string | number) => {
    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter(id => id !== optionId));
    } else {
      onChange([...selectedValues, optionId]);
    }
  };

  const handleRemoveOption = (optionId: string | number) => {
    onChange(selectedValues.filter(id => id !== optionId));
  };

  const handleClearAll = () => {
    onChange([]);
  };


  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label} {selectedValues.length > 0 && `(${selectedValues.length} selected)`}
      </label>
      
      {/* Selected Options Tags */}
      {selectedOptions.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  color === 'warning' 
                    ? 'bg-orange-100 text-orange-800 border-orange-200' 
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                {option.name}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option.id)}
                  className="inline-flex items-center justify-center w-4 h-4 text-xs hover:bg-black/10 rounded-full"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedOptions.length > 1 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dropdown */}
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          className={`relative w-full cursor-default rounded-lg bg-white py-3 pl-3 pr-10 text-left border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
            color === 'warning' 
              ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-500'
              : 'border-blue-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="block truncate text-gray-900">
            {selectedOptions.length === 0 
              ? placeholder 
              : `${selectedOptions.length} selected`}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
        
        {isOpen && (
          <ul className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => {
              const isSelected = selectedValues.map(v => String(v)).includes(String(option.id));
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    className={`relative cursor-default select-none py-2 pl-4 pr-4 w-full text-left hover:bg-gray-50 ${
                      isSelected 
                        ? color === 'warning' 
                          ? 'bg-orange-50 text-orange-900' 
                          : 'bg-blue-50 text-blue-900'
                        : 'text-gray-900'
                    }`}
                    onClick={() => handleToggleOption(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                          {option.name}
                        </span>
                        {option.description && (
                          <span className="block text-xs text-gray-500 truncate">
                            {option.description}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DaisyMultiSelect;