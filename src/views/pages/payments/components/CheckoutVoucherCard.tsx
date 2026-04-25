import { PrimaryButton, TrashButton } from "@/components";
import { useTranslation } from "react-i18next";
import type { CouponResponse } from "@/types";
import { formatDateFull, formatPrice } from "@/utils/format";
import { cn } from "@/utils/cn";

interface CheckoutVoucherCardProps {
  voucher: CouponResponse;
  userLoggedIn: boolean;
  isApplied: boolean;
  isSaved: boolean;
  isSaving: boolean;
  onApply: (voucher: CouponResponse) => void;
  onRemove: () => void;
  onSave: (voucher: CouponResponse) => void;
  onUnsave: (voucherId: string) => void;
}

const VOUCHER_STYLES = {
  shipping: {
    containerClassName:
      "border-blue-100 bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/70 dark:border-blue-900/60 dark:from-blue-950/30 dark:via-slate-900 dark:to-cyan-950/20",
    glowClassName: "from-blue-400/10 via-cyan-300/5 to-transparent",
    badgeClassName:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  product: {
    containerClassName:
      "border-violet-100 bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/70 dark:border-violet-900/60 dark:from-violet-950/25 dark:via-slate-900 dark:to-fuchsia-950/20",
    glowClassName: "from-violet-400/10 via-fuchsia-300/5 to-transparent",
    badgeClassName:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
} as const;

const CTA_BUTTON_CLASS =
  "h-11 min-w-[8.5rem] shrink-0 justify-center rounded-2xl px-5 text-base font-semibold shadow-none";

export default function CheckoutVoucherCard({
  voucher,
  userLoggedIn,
  isApplied,
  isSaved,
  isSaving,
  onApply,
  onRemove,
  onSave,
  onUnsave,
}: CheckoutVoucherCardProps) {
  const { t } = useTranslation("checkout");
  const isFreeShip = voucher.couponCategory === "SHIPPING";
  const style = isFreeShip ? VOUCHER_STYLES.shipping : VOUCHER_STYLES.product;
  const remainingUses = Math.max(0, (voucher.usageLimit || 0) - (voucher.usedCount || 0));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-3.5 sm:p-4",
        style.containerClassName,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-r opacity-80",
          style.glowClassName,
        )}
      />
      <div className="relative grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold">{voucher.code}</span>
            <span
              className={cn(
                "rounded-md px-2 py-1 text-10 font-bold uppercase tracking-wide",
                style.badgeClassName,
              )}
            >
              {isFreeShip ? t("voucherCard.shippingTag") : t("voucherCard.productTag")}
            </span>
          </div>
          <p className="mt-0.5 text-md font-bold text-slate-800 dark:text-slate-100">
            {voucher.discountType === "PERCENTAGE"
              ? t("voucherCard.discountPercent", { value: voucher.discountValue })
              : t("voucherCard.discountAmount", { value: formatPrice(voucher.discountValue) })}
          </p>
          {voucher.minOrderValue ? (
            <p className="mt-1 text-sm text-slate-500">
              {t("voucherCard.minOrderValue", { value: formatPrice(voucher.minOrderValue) })}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
            {voucher.endDate ? (
              <span className="inline-flex items-center rounded-xl bg-white/80 px-3 py-1 dark:bg-slate-900/70">
                {t("voucherCard.expiry", { date: formatDateFull(voucher.endDate) })}
              </span>
            ) : null}
            {voucher.usageLimit ? (
              <span className="inline-flex items-center rounded-xl bg-white/80 px-3 py-1 dark:bg-slate-900/70">
                {t("voucherCard.remainingUses", { count: remainingUses })}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2.5">
          {isApplied ? (
            <PrimaryButton
              onClick={onRemove}
              variant="outline"
              className={CTA_BUTTON_CLASS}
            >
              {t("voucherCard.remove")}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() => onApply(voucher)}
              className={cn(CTA_BUTTON_CLASS, "hover:translate-y-0")}
            >
              {t("voucherCard.apply")}
            </PrimaryButton>
          )}

          {userLoggedIn ? (
            isSaved ? (
              <div className="inline-flex items-center justify-end gap-2 text-sm font-semibold text-emerald-600">
                {t("voucherCard.saved")}
                <TrashButton
                  onClick={() => onUnsave(voucher.id)}
                  disabled={isSaving}
                  title={t("voucherCard.removeSaved")}
                  className="h-7 w-7 rounded-lg"
                />
              </div>
            ) : (
              <PrimaryButton
                onClick={() => onSave(voucher)}
                disabled={isSaving}
                variant="outline"
                className={CTA_BUTTON_CLASS}
              >
                {isSaving ? t("voucherCard.saving") : t("voucherCard.saveToWallet")}
              </PrimaryButton>
            )
          ) : (
            <span className="text-sm text-slate-400">{t("voucherCard.loginToSave")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
