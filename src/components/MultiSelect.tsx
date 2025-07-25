import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface MultiSelectOption {
  id: string | number;
  name: string;
  description?: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
  color?: 'blue' | 'orange' | 'green' | 'purple';
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = "",
  color = 'blue'
}) => {
  const selectedOptions = options.filter(option => selectedValues.includes(option.id));
  
  const colorClasses = {
    blue: {
      tag: 'bg-blue-100 text-blue-800 border-blue-200',
      button: 'border-blue-300 focus:border-blue-500 focus:ring-blue-500',
      option: 'ui-active:bg-blue-600 ui-active:text-white',
      selectedOption: 'bg-blue-50 text-blue-900'
    },
    orange: {
      tag: 'bg-orange-100 text-orange-800 border-orange-200',
      button: 'border-orange-300 focus:border-orange-500 focus:ring-orange-500',
      option: 'ui-active:bg-orange-600 ui-active:text-white',
      selectedOption: 'bg-orange-50 text-orange-900'
    },
    green: {
      tag: 'bg-green-100 text-green-800 border-green-200',
      button: 'border-green-300 focus:border-green-500 focus:ring-green-500',
      option: 'ui-active:bg-green-600 ui-active:text-white',
      selectedOption: 'bg-green-50 text-green-900'
    },
    purple: {
      tag: 'bg-purple-100 text-purple-800 border-purple-200',
      button: 'border-purple-300 focus:border-purple-500 focus:ring-purple-500',
      option: 'ui-active:bg-purple-600 ui-active:text-white',
      selectedOption: 'bg-purple-50 text-purple-900'
    }
  };

  const colors = colorClasses[color];


  const handleRemoveOption = (optionId: string | number) => {
    onChange(selectedValues.filter(id => id !== optionId));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      
      {/* Selected Options Tags */}
      {selectedOptions.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${colors.tag}`}
              >
                {option.name}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option.id)}
                  className="inline-flex items-center justify-center w-4 h-4 text-xs hover:bg-black/10 rounded-full"
                >
                  <XMarkIcon className="w-3 h-3" />
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

      <Listbox value={selectedValues} onChange={onChange} multiple>
        <div className="relative">
          <Listbox.Button className={`relative w-full cursor-default rounded-lg bg-white py-3 pl-3 pr-10 text-left border ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm`}>
            <span className="block truncate text-gray-900">
              {selectedOptions.length === 0 
                ? placeholder 
                : `${selectedOptions.length} selected`}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.id);
                return (
                  <Listbox.Option
                    key={option.id}
                    value={option.id}
                    className={({ active }) => `
                      relative cursor-default select-none py-2 pl-4 pr-4 
                      ${active ? colors.option : 'text-gray-900'}
                      ${isSelected ? colors.selectedOption : ''}
                    `}
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
                  </Listbox.Option>
                );
              })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default MultiSelect;