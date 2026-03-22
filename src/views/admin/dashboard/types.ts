import type { DashboardStatsResponse } from '@/apis/services/adminDashboardService';

export interface DashboardStatsProps {
  stats: DashboardStatsResponse;
  onOpenModal: (modal: string) => void;
}

export interface DashboardChildProps {
  stats: DashboardStatsResponse;
}
