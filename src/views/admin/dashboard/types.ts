import type { DashboardStatsResponse } from '@/types';

export interface DashboardStatsProps {
  stats: DashboardStatsResponse;
  onOpenModal: (modal: string) => void;
}

export interface DashboardChildProps {
  stats: DashboardStatsResponse;
}
