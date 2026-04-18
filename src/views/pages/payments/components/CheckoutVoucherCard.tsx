import { PrimaryButton, TrashButton } from "@/components";
import { useTranslation } from "react-i18next";
import type { CouponResponse } from "@/types";
import { formatPrice } from "@/utils/format";
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

  return (
    <div
      className={cn(
        "relative overflow-hidden space-y-3 rounded-xl border p-4",
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
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
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
          <p className="mt-1 text-md font-bold text-slate-800 dark:text-slate-100">
            {voucher.discountType === "PERCENTAGE"
              ? t("voucherCard.discountPercent", { value: voucher.discountValue })
              : t("voucherCard.discountAmount", { value: formatPrice(voucher.discountValue) })}
          </p>
          {voucher.minOrderValue ? (
            <p className="mt-1 text-sm text-slate-500">
              {t("voucherCard.minOrderValue", { value: formatPrice(voucher.minOrderValue) })}
            </p>
          ) : null}
        </div>

        {isApplied ? (
          <PrimaryButton
            onClick={onRemove}
            variant="outline"
            className="h-8 shrink-0 px-3 text-sm shadow-none"
          >
            {t("voucherCard.remove")}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => onApply(voucher)}
            className="h-8 shrink-0 px-3 text-sm shadow-none hover:translate-y-0"
          >
            {t("voucherCard.apply")}
          </PrimaryButton>
        )}
      </div>

      <div className="relative flex justify-end">
        {userLoggedIn ? (
          isSaved ? (
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
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
              className="h-8 px-3 text-sm shadow-none"
            >
              {isSaving ? t("voucherCard.saving") : t("voucherCard.saveToWallet")}
            </PrimaryButton>
          )
        ) : (
          <span className="text-sm text-slate-400">{t("voucherCard.loginToSave")}</span>
        )}
      </div>
    </div>
  );
}
