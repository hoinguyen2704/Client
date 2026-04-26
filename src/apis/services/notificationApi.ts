import adminNotificationService from "./adminNotificationService";
import notificationService from "./notificationService";
import type { NotificationRole } from "@/types";

export function getNotificationApiByRole(role?: NotificationRole | null) {
  return role === "ADMIN" ? adminNotificationService : notificationService;
}

export function getStoredNotificationRole(): NotificationRole | null {
  try {
    const raw = localStorage.getItem("auth") || sessionStorage.getItem("auth");
    const role = raw ? JSON.parse(raw)?.state?.user?.role : null;
    return role === "ADMIN" || role === "USER" ? role : null;
  } catch {
    return null;
  }
}
