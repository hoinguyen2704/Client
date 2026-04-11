import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

// Base class shared between input and textarea
const BASE_CLASS =
  "w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-md focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-50";

const INPUT_CLASS = `${BASE_CLASS} h-10 px-4`;
const TEXTAREA_CLASS = `${BASE_CLASS} p-4 resize-none`;

//  FormInput

interface FormInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  /** Append extra Tailwind classes (e.g. "uppercase font-mono") */
  inputClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, inputClassName = "", className = "", ...rest }, ref) => (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-md font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`${INPUT_CLASS} ${inputClassName}`}
        {...rest}
      />
    </div>
  ),
);
FormInput.displayName = "FormInput";

//  FormTextarea

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  inputClassName?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, inputClassName = "", className = "", ...rest }, ref) => (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-md font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`${TEXTAREA_CLASS} ${inputClassName}`}
        {...rest}
      />
    </div>
  ),
);
FormTextarea.displayName = "FormTextarea";

//  FormSelect

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  label?: string;
  options: FormSelectOption[];
  inputClassName?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, inputClassName = "", className = "", ...rest }, ref) => (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-md font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`${INPUT_CLASS} ${inputClassName}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
);
FormSelect.displayName = "FormSelect";
