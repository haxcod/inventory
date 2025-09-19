import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  error?: boolean;
  errorMessage?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  id,
  name,
  error = false,
  errorMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex < options.length ? nextIndex : 0;
          });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => {
            const prevIndex = prev - 1;
            return prevIndex >= 0 ? prevIndex : options.length - 1;
          });
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className="relative" ref={selectRef}>
      <div
        id={id}
        name={name}
         className={cn(
           "relative w-full px-4 py-3 text-left bg-white dark:bg-black border-2 rounded-xl shadow-sm cursor-pointer transition-all duration-200",
           "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
           "hover:border-gray-300 dark:hover:border-gray-600",
           error 
             ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
             : "border-gray-200 dark:border-gray-600",
           disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800",
           isOpen && "ring-2 ring-blue-500 border-blue-500",
           className
         )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
         <span className={cn(
           "block truncate text-gray-900 dark:text-white font-medium",
           !selectedOption && "text-gray-500 dark:text-gray-300"
         )}>
           {selectedOption ? selectedOption.label : placeholder}
         </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
           <ChevronDownIcon 
             className={cn(
               "h-5 w-5 text-gray-500 dark:text-gray-300 transition-transform duration-200",
               isOpen && "rotate-180"
             )}
           />
        </span>
      </div>

       {isOpen && (
         <div className="absolute z-50 w-full mt-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-auto">
           {options.length === 0 ? (
             <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
               No options available
             </div>
           ) : (
             options.map((option, index) => (
               <div
                 key={option.value}
                 ref={el => optionRefs.current[index] = el}
                 className={cn(
                   "relative px-4 py-3 cursor-pointer transition-colors duration-150",
                   "hover:bg-gray-100 dark:hover:bg-gray-800",
                   focusedIndex === index && "bg-gray-100 dark:bg-gray-800",
                   option.disabled && "opacity-50 cursor-not-allowed",
                   selectedOption?.value === option.value && "bg-blue-50 dark:bg-gray-700 selected-option"
                 )}
                 onClick={() => handleOptionClick(option)}
                 onMouseEnter={() => setFocusedIndex(index)}
                 role="option"
                 aria-selected={selectedOption?.value === option.value}
                 aria-disabled={option.disabled}
               >
                 <div className="flex items-center justify-between">
                   <span className="block truncate text-gray-900 dark:text-white font-medium">
                     {option.label}
                   </span>
                   {selectedOption?.value === option.value && (
                     <CheckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                   )}
                 </div>
               </div>
             ))
           )}
         </div>
       )}

      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Select;
