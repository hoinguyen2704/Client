import type { ReactNode } from "react";
import {
  FiBell,
  FiCreditCard,
  FiFileText,
  FiFolder,
  FiInfo,
  FiMessageSquare,
  FiSettings,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiTruck,
  FiUser,
  FiZap,
} from "react-icons/fi";
import type { NotificationRole, NotificationResponse } from "@/types";

const typeIcons: Record<string, ReactNode> = {
  ORDER: <FiShoppingBag className="text-blue-500" />,
  PAYMENT: <FiCreditCard className="text-emerald-500" />,
  RETURN: <FiTruck className="text-orange-500" />,
  SUPPORT: <FiMessageSquare className="text-amber-500" />,
  PROMOTION: <FiTag className="text-indigo-500" />,
  SYSTEM: <FiInfo className="text-body" />,
  USER_ADMIN: <FiUser className="text-sky-500" />,
  CATALOG: <FiFolder className="text-fuchsia-500" />,
  COUPON: <FiTag className="text-violet-500" />,
  FLASH_SALE: <FiZap className="text-yellow-500" />,
  CONTENT: <FiFileText className="text-cyan-500" />,
  SETTINGS: <FiSettings className="text-body" />,
  FEEDBACK: <FiStar className="text-rose-500" />,
};

export function getNotificationIcon(type?: string) {
  return type ? typeIcons[type] || <FiBell className="text-subtle" /> : <FiBell className="text-subtle" />;
}

export function getNotificationCenterPath(role?: NotificationRole | null) {
  return role === "ADMIN" ? "/admin/notifications" : "/user/notifications";
}

export function getNotificationTargetUrl(notification: NotificationResponse) {
  return notification.targetUrl || null;
}
