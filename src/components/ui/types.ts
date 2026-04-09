import type { InputHTMLAttributes, ReactNode } from "react";
import type { ProductResponse } from '@/types/product';

//  Card
export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

//  EmptyState
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

//  StatusBadge
export type StatusType =
  | "completed"
  | "delivered"
  | "processing"
  | "shipping"
  | "cancelled"
  | "pending"
  | "verified"
  | "active"
  | "inactive"
  | "expired"
  | "open"
  | "in_progress"
  | "replied"
  | "closed"
  | "vip"
  | "banned"
  | "published"
  | "draft"
  | "hidden"
  | "upcoming"
  | "ended"
  | "approved"
  | "spam"
  | "admin"
  | "user"
  | "ACTIVE"
  | "INACTIVE"
  | "UPCOMING"
  | "ENDED"
  | "EXPIRED"
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPING"
  | "SHIPPED"
  | "CANCELLED"
  | "RETURNED"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "low_stock"
  | "out_of_stock"
  | "OPEN"
  | "IN_PROGRESS"
  | "ANSWERED"
  | "RESOLVED"
  | "CLOSED";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

//  ConfirmDialog
export type ConfirmVariant = "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

//  Modal
export type ModalSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Content inside the modal body */
  children: ReactNode;
  /** Footer with action buttons */
  footer?: ReactNode;
  /** Max width: sm=384, md=512(default), lg=640, xl=768 */
  size?: ModalSize;
  /** If true, body gets max-h and overflow scroll */
  scrollable?: boolean;
  /** Extra className for modal panel */
  className?: string;
  /** Extra className for the fixed container (e.g. z-index override) */
  containerClassName?: string;
}

export interface ModalCancelButtonProps {
  onClick: () => void;
  children?: ReactNode;
}

export interface ModalSubmitButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  children?: ReactNode;
  variant?: "primary" | "danger";
}

//  StarRating
export type StarSize = "sm" | "md" | "lg";

export interface StarRatingProps {
  /** Current rating value (1-5) */
  value: number;
  /** Callback when user selects a star */
  onChange: (value: number) => void;
  /** Size of each star icon */
  size?: StarSize;
  /** Show text label next to stars */
  showLabel?: boolean;
  /** Custom labels map override */
  labels?: Record<number, string>;
  /** Read-only display mode (no interaction) */
  readOnly?: boolean;
}

//  AdminPagination
export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  label?: string;
  onPageChange: (page: number) => void;
}

//  AdminSearch
export interface AdminSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  /** Extra filter elements (selects, buttons) rendered on the right */
  filters?: ReactNode;
}

//  ActionButtons
export type ActionType = "edit" | "delete" | "view" | "more";

export interface ActionConfig {
  type: ActionType;
  /** Link href — makes this a Link instead of button */
  href?: string;
  /** Custom title tooltip */
  title?: string;
  /** Custom icon override */
  icon?: ReactNode;
  /** Click handler for buttons */
  onClick?: () => void;
  /** Hide this button */
  hidden?: boolean;
}

export interface ActionButtonsProps {
  actions: ActionConfig[];
}

//  PrimaryButton
export interface PrimaryButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "outline";
  isLoading?: boolean;
}

//  Button
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline"
  | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
  onClick?: () => void;
  href?: string;
  form?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  title?: string;
  ariaLabel?: string;
}

//  IconButton
export type IconButtonVariant = "neutral" | "primary" | "danger" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
}

//  SwitchToggle
export type SwitchTone = "primary" | "success" | "blue" | "slate";

export interface SwitchToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tone?: SwitchTone;
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
}

//  Checkbox
export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onCheckedChange?: (checked: boolean) => void;
}

//  Radio
export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onCheckedChange?: (checked: boolean) => void;
}

//  BackButton
export interface BackButtonProps {
  /** Navigation target path */
  to: string;
  /** Optional text label — if provided, renders inline text link instead of icon-only */
  label?: string;
  className?: string;
}

//  ProductCard
export interface ProductCardProps {
  product: ProductResponse;
}

//  Chatbot
export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}
