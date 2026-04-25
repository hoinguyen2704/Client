import type { ReactNode } from "react";
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical } from "react-icons/fi";
import type { ActionType } from "../types";

//  ActionButtons config
export const ACTION_STYLES: Record<ActionType, string> = {
  edit: "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400",
  delete:
    "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400",
  view: "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400",
  more: "text-muted bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
};

export const ACTION_ICONS: Record<ActionType, ReactNode> = {
  edit: <FiEdit2 />,
  delete: <FiTrash2 />,
  view: <FiEye />,
  more: <FiMoreVertical />,
};

export const ACTION_TITLES: Record<ActionType, string> = {
  edit: "actions.edit",
  delete: "actions.delete",
  view: "actions.viewDetails",
  more: "actions.more",
};
