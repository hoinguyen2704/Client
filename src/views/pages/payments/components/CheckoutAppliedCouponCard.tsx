import { Button, IconButton } from "@/components";
import type { CouponResponse } from "@/types";
import { FiBookmark, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

type AppliedCouponVariant = "product" | "shipping";

interface CheckoutAppliedCouponCardProps {
  coupon: CouponResponse;
  variant: AppliedCouponVariant;
  userLoggedIn: boolean;
  isSaved: boolean;
  isSaving: boolean;
  onSave: (coupon: CouponResponse) => void;
  onRemove: () => void;
}

const VARIANT_CONFIG: Record<
  AppliedCouponVariant,
  {
    containerClassName: string;
    accentClassName: string;
    saveButtonClassName: string;
  }
> = {
  product: {
    containerClassName:
      "border border-blue-100 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20",
    accentClassName: "text-blue-600",
    saveButtonClassName:
      "from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700",
  },
  shipping: {
    containerClassName:
      "border border-blue-100 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20",
    accentClassName: "text-blue-600",
    saveButtonClassName:
      "from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700",
  },
};

export default function CheckoutAppliedCouponCard({
  coupon,
  variant,
  userLoggedIn,
  isSaved,
  isSaving,
  onSave,
  onRemove,
}: CheckoutAppliedCouponCardProps) {
  const { t } = useTranslation("checkout");
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      className={`flex flex-col justify-between gap-3 rounded-xl p-3 text-md sm:flex-row sm:items-center ${config.containerClassName}`}
    >
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${config.accentClassName}`}>
          {variant === "product" ? t("appliedVoucher.productTitle") : t("appliedVoucher.shippingTitle")}
        </span>
        <span className="text-muted">
          {t("appliedVoucher.appliedCode", { code: coupon.code })}
        </span>
      </div>

      {userLoggedIn ? (
        <div className="flex items-center gap-2">
          {isSaved ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {t("appliedVoucher.savedInWallet")}
            </span>
          ) : coupon.isPublic ? (
            <Button
              type="button"
              onClick={() => onSave(coupon)}
              disabled={isSaving}
              size="sm"
              icon={<FiBookmark className="text-md" />}
              className={`h-8 whitespace-nowrap rounded-lg px-3 ${config.saveButtonClassName}`}
            >
              {t("appliedVoucher.saveToWallet")}
            </Button>
          ) : null}

          <IconButton
            onClick={onRemove}
            icon={<FiX className="h-4 w-4" />}
            className="h-7 w-7 rounded-md text-subtle hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            title={t("appliedVoucher.remove")}
            variant="ghost"
          />
        </div>
      ) : (
        <span className="text-subtle">{t("appliedVoucher.loginToSave")}</span>
      )}
    </div>
  );
}
