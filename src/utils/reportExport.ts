import type { ReportExportParams } from '@/types';

export function getDefaultReportExportParams(): ReportExportParams {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  return {
    mode: 'CUSTOM',
    fromDate: `${yyyy}-${mm}-01`,
    toDate: `${yyyy}-${mm}-${dd}`,
    month: `${yyyy}-${mm}`,
    year: String(yyyy),
  };
}

export function isValidReportExportParams(params: ReportExportParams): boolean {
  if (params.mode === 'CUSTOM') {
    if (!params.fromDate || !params.toDate) {
      return false;
    }
    return params.fromDate <= params.toDate;
  }

  if (params.mode === 'MONTH') {
    return Boolean(params.month);
  }

  if (params.mode === 'YEAR') {
    return Boolean(params.year?.trim());
  }

  return false;
}

export function buildReportRangeLabel(params: ReportExportParams): string {
  if (params.mode === 'CUSTOM') {
    return `${params.fromDate}_${params.toDate}`;
  }

  if (params.mode === 'MONTH') {
    return params.month || 'month';
  }

  return params.year || 'year';
}

export function buildReportFilename(prefix: string, params: ReportExportParams): string {
  return `${prefix}_${buildReportRangeLabel(params)}.xlsx`;
}
