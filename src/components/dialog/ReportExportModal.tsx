import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload } from 'react-icons/fi';
import { Button, CustomSelect, FormInput, Modal } from '@/components';
import type { ReportExportParams } from '@/types';
import { getDefaultReportExportParams, isValidReportExportParams } from '@/utils/reportExport';

interface ReportExportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (params: ReportExportParams) => Promise<void>;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export default function ReportExportModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel,
}: ReportExportModalProps) {
  const { t } = useTranslation(['adminSales', 'adminDashboard', 'common']);
  const [params, setParams] = useState<ReportExportParams>(getDefaultReportExportParams);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setParams(getDefaultReportExportParams());
    }
  }, [open]);

  const modeOptions = useMemo(
    () => [
      { value: 'CUSTOM', label: t('reportExport.modes.custom') },
      { value: 'MONTH', label: t('reportExport.modes.month') },
      { value: 'YEAR', label: t('reportExport.modes.year') },
    ],
    [t],
  );

  const isValid = isValidReportExportParams(params);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    let isSuccess = false;
    try {
      await onSubmit(params);
      isSuccess = true;
    } catch {
      // Parent handles the toast/error message; keep the modal open.
    } finally {
      setIsSubmitting(false);
    }

    if (isSuccess) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      title={title || t('reportExport.title')}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-md text-muted">
          {description || t('reportExport.description')}
        </p>

        <div className="space-y-1.5">
          <label className="block text-md font-medium text-body">
            {t('reportExport.rangeModeLabel')}
          </label>
          <CustomSelect
            value={params.mode}
            onChange={(value) => setParams((current) => ({
              ...current,
              mode: value as ReportExportParams['mode'],
            }))}
            options={modeOptions}
            className="h-10"
          />
        </div>

        {params.mode === 'CUSTOM' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label={t('reportExport.fromDateLabel')}
              type="date"
              value={params.fromDate || ''}
              onChange={(event) => setParams((current) => ({ ...current, fromDate: event.target.value }))}
            />
            <FormInput
              label={t('reportExport.toDateLabel')}
              type="date"
              value={params.toDate || ''}
              onChange={(event) => setParams((current) => ({ ...current, toDate: event.target.value }))}
            />
          </div>
        ) : null}

        {params.mode === 'MONTH' ? (
          <FormInput
            label={t('reportExport.monthLabel')}
            type="month"
            value={params.month || ''}
            onChange={(event) => setParams((current) => ({ ...current, month: event.target.value }))}
          />
        ) : null}

        {params.mode === 'YEAR' ? (
          <FormInput
            label={t('reportExport.yearLabel')}
            type="number"
            min="2000"
            max="9999"
            step="1"
            value={params.year || ''}
            onChange={(event) => setParams((current) => ({ ...current, year: event.target.value }))}
          />
        ) : null}

        {!isValid ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {t('reportExport.invalidRange')}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {t('common:modal.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="success"
            icon={<FiDownload />}
            className="w-full sm:w-auto"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? t('reportExport.submitting') : (submitLabel || t('reportExport.submit'))}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
