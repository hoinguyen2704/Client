import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiPackage, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { FEEDBACK_IMAGE_ACCEPT, MAX_FEEDBACK_IMAGES } from '@/constants/feedbackConstants';
import type { FeedbackResponse, ReviewComposerItem, ReviewComposerSubmitData } from '@/types';
import { parseFeedbackImageUrls } from '@/utils/feedback';
import Button from '../button/Button';
import Modal, { ModalCancelButton } from '../dialog/Modal';
import StarRating from '../rating/StarRating';
import FeedbackImageGrid from './FeedbackImageGrid';

interface ReviewComposerModalProps {
  open: boolean;
  onClose: () => void;
  item: ReviewComposerItem | null;
  previousFeedbacks?: FeedbackResponse[];
  submitting?: boolean;
  onSubmit: (payload: ReviewComposerSubmitData) => Promise<void> | void;
  maxReviewAttempts?: number;
}

interface PendingImage {
  file: File;
  previewUrl: string;
}

function revokePendingImages(images: PendingImage[]) {
  images.forEach((image) => {
    URL.revokeObjectURL(image.previewUrl);
  });
}

export default function ReviewComposerModal({
  open,
  onClose,
  item,
  previousFeedbacks = [],
  submitting = false,
  onSubmit,
  maxReviewAttempts = 2,
}: ReviewComposerModalProps) {
  const { t } = useTranslation('account');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImagesRef = useRef<PendingImage[]>([]);

  const canSubmit = previousFeedbacks.length < maxReviewAttempts;
  const title = useMemo(
    () => (previousFeedbacks.length > 0
      ? t('reviewComposer.extraReviewTitle')
      : t('reviewComposer.reviewTitle')),
    [previousFeedbacks.length, t],
  );

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  const resetDraft = useCallback(() => {
    setRating(5);
    setContent('');
    setPendingImages((current) => {
      revokePendingImages(current);
      return [];
    });
  }, []);

  useEffect(() => {
    if (open) {
      resetDraft();
    }
  }, [open, item?.orderNumber, item?.productName, resetDraft]);

  useEffect(() => () => {
    revokePendingImages(pendingImagesRef.current);
  }, []);

  const handleFilesSelected = useCallback((fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.toLowerCase().startsWith('image/'));
    if (imageFiles.length !== files.length) {
      toast.error(t('reviewComposer.toasts.invalidImageType'));
    }

    const remainingSlots = MAX_FEEDBACK_IMAGES - pendingImagesRef.current.length;
    if (remainingSlots <= 0) {
      toast.error(t('reviewComposer.toasts.imageLimitExceeded', { max: MAX_FEEDBACK_IMAGES }));
      return;
    }

    if (imageFiles.length > remainingSlots) {
      toast.error(t('reviewComposer.toasts.imageLimitExceeded', { max: MAX_FEEDBACK_IMAGES }));
    }

    const nextPendingImages = imageFiles
      .slice(0, remainingSlots)
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setPendingImages((current) => [...current, ...nextPendingImages]);
  }, [t]);

  const handleRemovePendingImage = (index: number) => {
    setPendingImages((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleSubmit = async () => {
    if (!item || !canSubmit) {
      return;
    }

    const normalizedContent = content.trim();

    await onSubmit({
      rating,
      content: normalizedContent,
      imageFiles: pendingImages.map((image) => image.file),
    });
  };

  return (
    <Modal
      open={open && !!item}
      onClose={onClose}
      title={title}
      size="lg"
      scrollable
      footer={(
        <>
          <ModalCancelButton onClick={onClose}>{t('reviewComposer.back')}</ModalCancelButton>
          {canSubmit ? (
            <Button
              onClick={handleSubmit}
              size="md"
              loading={submitting}
              disabled={!item}
            >
              {t('reviewComposer.submit')}
            </Button>
          ) : (
            <Button disabled size="md">
              {t('reviewComposer.maxReviewed')}
            </Button>
          )}
        </>
      )}
    >
      {item && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-900">
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FiPackage className="text-2xl text-subtle" />
              )}
            </div>

            <div className="min-w-0">
              <h4 className="line-clamp-2 text-lg font-bold text-ink">{item.productName}</h4>
              <p className="mt-1 text-md text-muted">
                {t('reviewComposer.variant')}: {item.variantName || t('reviewComposer.defaultVariant')}
              </p>
              {item.orderNumber && (
                <p className="text-md text-muted">
                  {t('reviewComposer.order')}: {item.orderNumber}
                </p>
              )}
            </div>
          </div>

          {previousFeedbacks.length > 0 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-body">{t('reviewComposer.previousReviews')}</p>
              {previousFeedbacks.map((feedback, index) => {
                const feedbackImages = parseFeedbackImageUrls(feedback.imagesJson);
                return (
                  <div
                    key={feedback.id}
                    className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-md font-semibold text-body">
                        {t('reviewComposer.roundLabel', { count: index + 1 })}
                      </p>
                      <StarRating value={feedback.rating} onChange={() => {}} readOnly size="sm" />
                    </div>

                    {feedback.content && (
                      <p className="whitespace-pre-line text-md leading-7 text-muted">
                        {feedback.content}
                      </p>
                    )}

                    <FeedbackImageGrid
                      imageUrls={feedbackImages}
                      altPrefix={t('reviewComposer.reviewImageAlt')}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {canSubmit && (
            <>
              <div>
                <label className="mb-2 block text-lg font-semibold text-body">
                  {t('reviewComposer.ratingLabel')}
                </label>
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>

              <div>
                <label className="mb-2 block text-lg font-semibold text-body">
                  {t('reviewComposer.contentLabel')}
                </label>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={t('reviewComposer.contentPlaceholder')}
                  className="h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-md outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block text-lg font-semibold text-body">
                    {t('reviewComposer.imagesLabel')}
                  </label>
                  <span className="text-sm text-muted">
                    {t('reviewComposer.imagesCount', {
                      count: pendingImages.length,
                      max: MAX_FEEDBACK_IMAGES,
                    })}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={FEEDBACK_IMAGE_ACCEPT}
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleFilesSelected(event.target.files);
                    event.target.value = '';
                  }}
                />

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-body">{t('reviewComposer.imagesHelper')}</p>
                      <p className="text-sm text-muted">
                        {t('reviewComposer.imagesHint', { max: MAX_FEEDBACK_IMAGES })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<FiUploadCloud />}
                      className="border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                    </Button>
                  </div>

                  {pendingImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {pendingImages.map((image, index) => (
                        <div
                          key={`${image.file.name}-${index}`}
                          className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                        >
                          <img
                            src={image.previewUrl}
                            alt={t('reviewComposer.selectedImageAlt', { index: index + 1 })}
                            className="aspect-square h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePendingImage(index)}
                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/90 text-white shadow-sm transition hover:bg-red-600"
                            aria-label={t('reviewComposer.removeImageAria', { index: index + 1 })}
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
