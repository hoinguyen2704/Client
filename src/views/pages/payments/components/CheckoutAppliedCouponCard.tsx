import { Button, IconButton } from "@/components";
import type { CouponResponse } from "@/types";
import { FiBookmark, FiX } from "react-icons/fi";

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
    title: string;
    containerClassName: string;
    accentClassName: string;
    saveButtonClassName: string;
  }
> = {
  product: {
    title: "Voucher Sản Phẩm",
    containerClassName:
      "border border-purple-100 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/20",
    accentClassName: "text-purple-600",
    saveButtonClassName:
      "from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700",
  },
  shipping: {
    title: "Voucher Freeship",
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
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      className={`flex flex-col justify-between gap-3 rounded-xl p-3 text-md sm:flex-row sm:items-center ${config.containerClassName}`}
    >
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${config.accentClassName}`}>
          {config.title}
        </span>
        <span className="text-slate-600 dark:text-slate-300">
          Mã <strong className="font-mono">{coupon.code}</strong> đã áp dụng.
        </span>
      </div>

      {userLoggedIn ? (
        <div className="flex items-center gap-2">
          {isSaved ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Đã lưu trong ví
            </span>
          ) : coupon.isPublic ? (
            <Button
              type="button"
              onClick={() => onSave(coupon)}
              disabled={isSaving}
              size="sm"
              icon={<FiBookmark className="text-md" />}
              className={`h-8 rounded-lg px-3 ${config.saveButtonClassName}`}
            >
              Lưu vào ví
            </Button>
          ) : null}

          <IconButton
            onClick={onRemove}
            icon={<FiX className="h-4 w-4" />}
            className="h-7 w-7 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            title="Bỏ áp dụng"
            variant="ghost"
          />
        </div>
      ) : (
        <span className="text-slate-400">Đăng nhập để lưu mã</span>
      )}
    </div>
  );
}
