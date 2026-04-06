import type { ReactNode } from "react";
import { FiAlertTriangle, FiTrash2, FiRefreshCw } from "react-icons/fi";
import type { ConfirmVariant } from "../types";

//  ConfirmDialog variant config
export const CONFIRM_VARIANT_CONFIG: Record<
  ConfirmVariant,
  { icon: ReactNode; btnClass: string; iconBg: string }
> = {
  danger: {
    icon: <FiTrash2 className="text-xl" />,
    btnClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
  warning: {
    icon: <FiRefreshCw className="text-xl" />,
    btnClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    iconBg:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: <FiAlertTriangle className="text-xl" />,
    btnClass: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
    iconBg:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
};
