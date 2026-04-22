import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  FiCheck,
  FiChevronDown,
  FiLoader,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";

export interface CreatableSingleSelectOption {
  value: string;
  label: string;
}

interface CreatableSingleSelectProps {
  value: string;
  options: CreatableSingleSelectOption[];
  onChange: (value: string) => void;
  onCreate?: (label: string) => Promise<void> | void;
  allowClear?: boolean;
  disabled?: boolean;
  placeholder: string;
  searchPlaceholder: string;
  createLabel?: string;
  createPlaceholder?: string;
  emptyLabel: string;
  duplicateMessage?: string;
  className?: string;
}

const triggerFallbackClass =
  "bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700";
const idleOptionClass =
  "text-body hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white";

export default function CreatableSingleSelect({
  value,
  options,
  onChange,
  onCreate,
  allowClear = false,
  disabled = false,
  placeholder,
  searchPlaceholder,
  createLabel,
  createPlaceholder,
  emptyLabel,
  duplicateMessage,
  className = "",
}: CreatableSingleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [draftValue, setDraftValue] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const selectedOption = options.find((option) => option.value === value);
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLocaleLowerCase().includes(normalizedSearch),
      ),
    [normalizedSearch, options],
  );
  const trimmedDraftValue = draftValue.trim();
  const hasDuplicateDraft = useMemo(
    () =>
      trimmedDraftValue.length > 0
      && options.some(
        (option) =>
          option.label.trim().toLocaleLowerCase()
          === trimmedDraftValue.toLocaleLowerCase(),
      ),
    [options, trimmedDraftValue],
  );

  const resetTransientState = useCallback(() => {
    setSearch("");
    setIsCreating(false);
    setDraftValue("");
    setIsSubmittingCreate(false);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    resetTransientState();
  }, [resetTransientState]);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      zIndex: 9999,
      minWidth: Math.max(rect.width, 200),
    });
  }, []);

  const scheduleUpdatePosition = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      updatePosition();
    });
  }, [updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target)
        || dropdownRef.current?.contains(target)
      ) {
        return;
      }
      closeDropdown();
    };

    document.addEventListener("mousedown", handleClickOutside);
    scheduleUpdatePosition();
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown, isOpen, scheduleUpdatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => {
      scheduleUpdatePosition();
    };

    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);
    window.visualViewport?.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isOpen, scheduleUpdatePosition]);

  useEffect(() => {
    if (disabled) {
      closeDropdown();
    }
  }, [closeDropdown, disabled]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(() => {
      if (isCreating) {
        createInputRef.current?.focus();
        createInputRef.current?.select();
        return;
      }
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isCreating, isOpen]);

  const handleSelect = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      closeDropdown();
    },
    [closeDropdown, onChange],
  );

  const handleCreate = useCallback(async () => {
    if (!onCreate || !trimmedDraftValue || hasDuplicateDraft || isSubmittingCreate) {
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await onCreate(trimmedDraftValue);
      closeDropdown();
    } catch {
      setIsSubmittingCreate(false);
    }
  }, [
    closeDropdown,
    hasDuplicateDraft,
    isSubmittingCreate,
    onCreate,
    trimmedDraftValue,
  ]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          if (isOpen) {
            closeDropdown();
            return;
          }
          resetTransientState();
          setIsOpen(true);
        }}
        disabled={disabled}
        className={`flex h-full w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-md font-semibold shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 ${
          triggerFallbackClass
        } ${isOpen ? "ring-2 ring-blue-500/50 scale-[0.98]" : ""} ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <span className={selectedOption ? "" : "text-slate-400"}>
          {selectedOption?.label || placeholder}
        </span>
        <FiChevronDown
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl dark:border-slate-700/60 dark:bg-slate-800"
        >
          <div className="border-b border-slate-100 p-2 dark:border-slate-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-md" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg border-none bg-slate-50 pl-8 pr-3 text-md outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5">
            {allowClear && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-md font-medium transition-colors ${
                  !value
                    ? "bg-blue-50 font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                    : idleOptionClass
                }`}
              >
                <span>{placeholder}</span>
                {!value && (
                  <FiCheck className="stroke-[3] text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                {emptyLabel}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-md font-medium transition-colors ${
                      isSelected
                        ? "bg-blue-50 font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                        : idleOptionClass
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <FiCheck className="stroke-[3] text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {onCreate && createLabel && createPlaceholder && (
            <div className="border-t border-slate-100 p-2 dark:border-slate-700">
              {isCreating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={createInputRef}
                      type="text"
                      value={draftValue}
                      onChange={(event) => setDraftValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleCreate();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setIsCreating(false);
                          setDraftValue("");
                        }
                      }}
                      placeholder={createPlaceholder}
                      className="h-8 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-md outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void handleCreate();
                      }}
                      disabled={!trimmedDraftValue || hasDuplicateDraft || isSubmittingCreate}
                      className="flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmittingCreate ? (
                        <FiLoader className="animate-spin text-sm" />
                      ) : (
                        <FiCheck className="text-sm" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setDraftValue("");
                      }}
                      className="flex h-8 items-center rounded-lg px-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                  {hasDuplicateDraft && duplicateMessage && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {duplicateMessage}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-md font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FiPlus className="text-sm" />
                  {createLabel}
                </button>
              )}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
