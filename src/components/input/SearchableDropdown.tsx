import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  FiChevronDown,
  FiSearch,
  FiCheck,
  FiPlus,
  FiLoader,
} from "react-icons/fi";

type RenderMode = "inline" | "portal";

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (id: string) => void;
  items: Array<{ id: string; name: string }>;
  disabled?: boolean;
  lockedMessage?: string;
  placeholder: string;
  searchPlaceholder: string;
  onCreateNew?: (name: string) => void | Promise<void>;
  isCreatingProcess?: boolean;
  createPlaceholder?: string;
  createAddLabel?: string;
  allowClear?: boolean;
  emptyLabel?: string;
  duplicateCreateHint?: string;
  labelClassName?: string;
  buttonClassName?: string;
  required?: boolean;
  renderMode?: RenderMode;
}

export default function SearchableDropdown({
  label,
  value,
  onChange,
  items,
  disabled = false,
  lockedMessage,
  placeholder,
  searchPlaceholder,
  onCreateNew,
  isCreatingProcess = false,
  createPlaceholder,
  createAddLabel,
  allowClear = true,
  emptyLabel,
  duplicateCreateHint,
  labelClassName,
  buttonClassName = "h-12",
  required = true,
  renderMode = "inline",
}: SearchableDropdownProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const selectedItem = items.find((item) => item.id === value);
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const trimmedNewName = newName.trim();
  const resolvedCreatePlaceholder =
    createPlaceholder ?? t("searchableDropdown.createPlaceholder");
  const resolvedCreateAddLabel =
    createAddLabel ?? t("searchableDropdown.createAddLabel");
  const resolvedEmptyLabel = emptyLabel ?? t("searchableDropdown.emptyLabel");
  const hasDuplicateName = items.some(
    (item) => item.name.trim().toLowerCase() === trimmedNewName.toLowerCase(),
  );

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setIsCreatingMode(false);
    setSearchTerm("");
    setNewName("");
  }, []);

  const updatePortalPosition = useCallback(() => {
    if (renderMode !== "portal" || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom - 1,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, [renderMode]);

  const scheduleUpdatePortalPosition = useCallback(() => {
    if (renderMode !== "portal" || rafIdRef.current !== null) return;

    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      updatePortalPosition();
    });
  }, [renderMode, updatePortalPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedPortal = dropdownRef.current?.contains(target);

      if (clickedTrigger || clickedPortal) {
        return;
      }

      closeDropdown();
    };

    document.addEventListener("mousedown", handleClickOutside);

    if (renderMode === "portal") {
      updatePortalPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown, isOpen, renderMode, updatePortalPosition]);

  useEffect(() => {
    if (!isOpen || renderMode !== "portal") return;

    const handleViewportChange = () => {
      scheduleUpdatePortalPosition();
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
  }, [isOpen, renderMode, scheduleUpdatePortalPosition]);

  useEffect(() => {
    if (disabled) {
      closeDropdown();
    }
  }, [closeDropdown, disabled]);

  useEffect(() => {
    if (!value) return;
    closeDropdown();
  }, [closeDropdown, value]);

  const handleCreate = () => {
    if (
      !trimmedNewName
      || isCreatingProcess
      || hasDuplicateName
      || !onCreateNew
    ) {
      return;
    }

    void Promise.resolve(onCreateNew(trimmedNewName)).catch(() => undefined);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCreate();
    }

    if (event.key === "Escape") {
      setIsCreatingMode(false);
      setNewName("");
    }
  };

  const menuContent: ReactNode = (
    <div
      ref={dropdownRef}
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden ${
        renderMode === "inline"
          ? "absolute left-0 top-full mt-2 w-full rounded-xl z-40"
          : "rounded-b-xl rounded-t-none border-t-0"
      }`}
      style={renderMode === "portal" ? dropdownStyle : undefined}
    >
      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-md" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-md focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto p-1">
        {allowClear && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              closeDropdown();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
              !value
                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium"
                : "hover:bg-slate-50 dark:hover:bg-slate-700 text-muted"
            }`}
          >
            {!value && <FiCheck className="text-blue-500 flex-shrink-0" />}
            <span className={!value ? "" : "ml-5"}>{placeholder}</span>
          </button>
        )}

        {filteredItems.length === 0 && (
          <div className="px-3 py-3 text-sm text-muted">
            {resolvedEmptyLabel}
          </div>
        )}

        {filteredItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              onChange(item.id);
              closeDropdown();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
              value === item.id
                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium"
                : "hover:bg-slate-50 dark:hover:bg-slate-700 text-body"
            }`}
          >
            {value === item.id && (
              <FiCheck className="text-blue-500 flex-shrink-0" />
            )}
            <span className={value === item.id ? "" : "ml-5"}>{item.name}</span>
          </button>
        ))}
      </div>

      {onCreateNew && (
        <div className="border-t border-slate-100 dark:border-slate-700 p-2">
          {isCreatingMode ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={resolvedCreatePlaceholder}
                  className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-md focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreatingProcess || !trimmedNewName || hasDuplicateName}
                  className="h-8 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {isCreatingProcess ? (
                    <FiLoader className="animate-spin text-sm" />
                  ) : (
                    <FiCheck className="text-sm" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingMode(false);
                    setNewName("");
                  }}
                  className="h-8 px-2 rounded-lg text-subtle hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              {hasDuplicateName && duplicateCreateHint && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {duplicateCreateHint}
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreatingMode(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-md font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <FiPlus className="text-sm" /> {resolvedCreateAddLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <label className={labelClassName || "block font-medium mb-2"}>
        {label}
        {required ? " *" : ""}
      </label>

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => {
            if (disabled) return;

            if (!isOpen && renderMode === "portal") {
              updatePortalPosition();
            }

            setIsOpen((prev) => !prev);
            setSearchTerm("");
          }}
          disabled={disabled}
          className={`w-full px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 flex items-center justify-between text-left transition-colors hover:border-slate-300 dark:hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-70 ${
            renderMode === "portal" && isOpen
              ? "rounded-b-none"
              : ""
          } ${buttonClassName}`}
        >
          <span
            className={value ? "text-ink" : "text-subtle"}
          >
            {selectedItem?.name || placeholder}
          </span>
          <FiChevronDown
            className={`text-subtle transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && renderMode === "inline" && menuContent}
      </div>

      {isOpen
        && renderMode === "portal"
        && typeof document !== "undefined"
        && createPortal(menuContent, document.body)}

      {disabled && lockedMessage && (
        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
          {lockedMessage}
        </p>
      )}
    </div>
  );
}
