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
  const triggerFallbackClass =
    'bg-white border-slate-200 text-ink dark:bg-slate-900 dark:border-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-slate-600';
  const idleOptionClass =
    'text-body hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-ink';

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const style: React.CSSProperties = {
      position: 'fixed',
      top: rect.bottom + 8,
      zIndex: 9999,
      width: Math.max(rect.width, 160),
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
        className={`w-full h-full flex items-center justify-between gap-2 px-3 py-2 text-md font-semibold rounded-xl border outline-none whitespace-nowrap focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all duration-200 ${
          selectedOption?.colorClass || triggerFallbackClass
        } ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span>{selectedOption?.label}</span>
        <FiChevronDown className={`text-opacity-70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="max-h-64 overflow-auto rounded-xl bg-white dark:bg-slate-900 p-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.14)] border border-slate-200 dark:border-slate-700/60 animate-in fade-in zoom-in-95 duration-200 ease-out"
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
                    ? (option.colorClass || 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold')
                    : idleOptionClass
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {!isSelected && option.colorClass && (
                    <span className={`w-2 h-2 rounded-full ${option.colorClass}`} style={{ backgroundColor: 'currentColor' }} />
                  )}
                  <span>{option.label}</span>
                </div>
                {isSelected && <FiCheck className="text-blue-600 dark:text-blue-300 stroke-[3]" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
