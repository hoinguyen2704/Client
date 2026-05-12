import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import adminExportJobService from '@/apis/services/adminExportJobService';
import type { ExportJobResponse, ExportJobType } from '@/types';
import { downloadBlob } from '@/utils/download';
import { getApiErrorMessage } from '@/utils/error';

interface StartExportOptions {
  type: ExportJobType;
  params?: Record<string, unknown>;
  fallbackFilename: string;
  successMessage: string;
  failureMessage: string;
}

const TERMINAL_STATUSES = new Set(['SUCCEEDED', 'FAILED', 'EXPIRED']);
const POLL_INTERVAL_MS = 2500;

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function buildRunningMessage(baseMessage: string, job: ExportJobResponse): string {
  if (typeof job.progress !== 'number') {
    return baseMessage;
  }
  const rowText = typeof job.totalRows === 'number' && job.totalRows > 0
    ? ` (${job.processedRows || 0}/${job.totalRows})`
    : '';
  return `${baseMessage} ${job.progress}%${rowText}`;
}

export function useAsyncExportJob() {
  const { t } = useTranslation('common');
  const [isExporting, setIsExporting] = useState(false);
  const inFlightRef = useRef(false);

  const startExport = useCallback(async (options: StartExportOptions) => {
    if (inFlightRef.current) return;

    const toastId = `export-${options.type.toLowerCase()}-${Date.now()}`;
    inFlightRef.current = true;
    setIsExporting(true);
    toast.loading(t('export.preparing'), { id: toastId });

    try {
      const created = await adminExportJobService.create({
        type: options.type,
        params: options.params,
      });
      let job = created.data;

      while (!TERMINAL_STATUSES.has(job.status)) {
        toast.loading(buildRunningMessage(t('export.running'), job), { id: toastId });
        await sleep(POLL_INTERVAL_MS);
        const polled = await adminExportJobService.get(job.jobId);
        job = polled.data;
      }

      if (job.status !== 'SUCCEEDED') {
        throw new Error(job.errorMessage || options.failureMessage);
      }

      toast.success(t('export.ready'), {
        id: toastId,
        duration: 60_000,
        action: {
          label: t('export.download'),
          onClick: async () => {
            try {
              toast.loading(t('export.downloading'), { id: toastId });
              const blob = await adminExportJobService.download(job.jobId);
              downloadBlob(blob, job.fileName || options.fallbackFilename);
              toast.success(options.successMessage, { id: toastId });
            } catch (error) {
              toast.error(getApiErrorMessage(error, options.failureMessage), { id: toastId });
            }
          },
        },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, options.failureMessage), { id: toastId });
    } finally {
      inFlightRef.current = false;
      setIsExporting(false);
    }
  }, [t]);

  return { isExporting, startExport };
}
