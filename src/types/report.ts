export type ReportRangeMode = 'CUSTOM' | 'MONTH' | 'YEAR';

export interface ReportExportParams {
  mode: ReportRangeMode;
  fromDate?: string;
  toDate?: string;
  month?: string;
  year?: string;
}
