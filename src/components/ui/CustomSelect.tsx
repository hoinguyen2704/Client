import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

export interface SelectOption {
  value: string;
  label: string;
  colorClass?: string;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  dropdownAlign?: 'left' | 'right';
}

export default function CustomSelect({ value, options, onChange, className = '', dropdownAlign = 'left' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className={`relative ${isOpen ? 'z-50' : ''} ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full h-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-semibold rounded-xl border outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm transition-all duration-200 ${
          selectedOption?.colorClass || 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700'
        } ${isOpen ? 'ring-2 ring-purple-500/50 scale-[0.98]' : ''}`}
      >
        <span>{selectedOption?.label}</span>
        <FiChevronDown className={`text-opacity-70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-[99] mt-2 max-h-64 min-w-[160px] overflow-auto rounded-xl bg-white dark:bg-slate-800 p-1.5 shadow-xl border border-slate-100 dark:border-slate-700/60 ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} animate-in fade-in zoom-in-95 duration-200 ease-out`}
          style={{ width: 'max-content' }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <FiCheck className="text-purple-600 dark:text-purple-400 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
