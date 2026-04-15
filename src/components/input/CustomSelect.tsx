import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  disabled?: boolean;
}

export default function CustomSelect({ value, options, onChange, className = '', dropdownAlign = 'left', disabled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const selectedOption = options.find(o => o.value === value) || options[0];

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const style: React.CSSProperties = {
      position: 'fixed',
      top: rect.bottom + 8,
      zIndex: 9999,
      minWidth: Math.max(rect.width, 160),
    };
    if (dropdownAlign === 'right') {
      style.right = window.innerWidth - rect.right;
    } else {
      style.left = rect.left;
    }
    setDropdownStyle(style);
  }, [dropdownAlign]);

  const scheduleUpdatePosition = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      updatePosition();
    });
  }, [updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      scheduleUpdatePosition();
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, scheduleUpdatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => {
      scheduleUpdatePosition();
    };

    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);
    window.visualViewport?.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isOpen, scheduleUpdatePosition]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full h-full flex items-center justify-between gap-2 px-3 py-2 text-md font-semibold rounded-xl border outline-none whitespace-nowrap focus:ring-2 focus:ring-purple-500/50 shadow-sm transition-all duration-200 ${
          selectedOption?.colorClass || 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700'
        } ${isOpen ? 'ring-2 ring-purple-500/50 scale-[0.98]' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span>{selectedOption?.label}</span>
        <FiChevronDown className={`text-opacity-70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="max-h-64 overflow-auto rounded-xl bg-white dark:bg-slate-800 p-1.5 shadow-xl border border-slate-100 dark:border-slate-700/60 animate-in fade-in zoom-in-95 duration-200 ease-out"
          style={dropdownStyle}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                 disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-md font-medium rounded-lg transition-colors duration-150 ${
                  isSelected
                    ? (option.colorClass || 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 font-bold')
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {!isSelected && option.colorClass && (
                    <span className={`w-2 h-2 rounded-full ${option.colorClass}`} style={{ backgroundColor: 'currentColor' }} />
                  )}
                  <span>{option.label}</span>
                </div>
                {isSelected && <FiCheck className="text-purple-600 dark:text-purple-400 stroke-[3]" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
