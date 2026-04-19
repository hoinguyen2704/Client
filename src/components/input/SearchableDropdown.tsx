import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { FiChevronDown, FiSearch, FiCheck, FiPlus, FiLoader } from "react-icons/fi";

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (id: string) => void;
  items: Array<{ id: string; name: string }>;
  disabled?: boolean;
  lockedMessage?: string;
  
  // Texts
  placeholder: string;
  searchPlaceholder: string;
  
  // Create New configuration
  onCreateNew?: (name: string) => void;
  isCreatingProcess?: boolean;
  createPlaceholder?: string;
  createAddLabel?: string;
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
  createPlaceholder = "Tên mới",
  createAddLabel = "Thêm mới",
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [newName, setNewName] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreatingMode(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When value changes from outside (e.g., successful creation), we can close mode
  useEffect(() => {
    if (value) {
      setIsCreatingMode(false);
      setNewName("");
      setIsOpen(false);
      setSearchTerm("");
    }
  }, [value]);

  const handleCreate = () => {
    if (!newName.trim() || isCreatingProcess || !onCreateNew) return;
    onCreateNew(newName);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === "Escape") {
      setIsCreatingMode(false);
      setNewName("");
    }
  };

  const selectedItem = items.find((i) => i.id === value);

  return (
    <div>
      <label className="block font-medium mb-2">{label} *</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setIsOpen(!isOpen);
            setSearchTerm("");
          }}
          disabled={disabled}
          className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className={value ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}>
            {selectedItem?.name || placeholder}
          </span>
          <FiChevronDown className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-md" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
                  !value
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {!value && <FiCheck className="text-purple-500 flex-shrink-0" />}
                <span className={!value ? "" : "ml-5"}>{placeholder}</span>
              </button>
              {items
                .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onChange(item.id);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
                      value === item.id
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {value === item.id && <FiCheck className="text-purple-500 flex-shrink-0" />}
                    <span className={value === item.id ? "" : "ml-5"}>{item.name}</span>
                  </button>
                ))}
            </div>
            
            {onCreateNew && (
              <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                {isCreatingMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={createPlaceholder}
                      className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={isCreatingProcess || !newName.trim()}
                      className="h-8 px-3 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {isCreatingProcess ? <FiLoader className="animate-spin text-sm" /> : <FiCheck className="text-sm" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingMode(false);
                        setNewName("");
                      }}
                      className="h-8 px-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreatingMode(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-md font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <FiPlus className="text-sm" /> {createAddLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {disabled && lockedMessage && (
        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
          {lockedMessage}
        </p>
      )}
    </div>
  );
}
