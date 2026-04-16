import { PrimaryButton, TrashButton } from "@/components";
import type { CouponResponse } from "@/types";
import { formatPrice } from "@/utils/format";

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
  const isFreeShip = voucher.couponCategory === "SHIPPING";

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold">{voucher.code}</span>
            <span
              className={`rounded-md px-2 py-1 text-10 font-bold uppercase tracking-wide ${
                isFreeShip
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              }`}
            >
              {isFreeShip ? "Freeship" : "Giảm giá SP"}
            </span>
          </div>
          <p className="mt-1 text-md font-bold text-slate-800 dark:text-slate-100">
            {voucher.discountType === "PERCENTAGE"
              ? `Giảm ${voucher.discountValue}%`
              : `Giảm ${formatPrice(voucher.discountValue)}`}
          </p>
          {voucher.minOrderValue ? (
            <p className="mt-1 text-sm text-slate-500">
              Đơn tối thiểu {formatPrice(voucher.minOrderValue)}
            </p>
          ) : null}
        </div>

        {isApplied ? (
          <PrimaryButton
            onClick={onRemove}
            variant="outline"
            className="h-8 shrink-0 px-3 text-sm shadow-none"
          >
            Bỏ áp dụng
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => onApply(voucher)}
            className="h-8 shrink-0 px-3 text-sm shadow-none hover:translate-y-0"
          >
            Áp dụng
          </PrimaryButton>
        )}
      </div>

      <div className="flex justify-end">
        {userLoggedIn ? (
          isSaved ? (
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              Đã lưu
              <TrashButton
                onClick={() => onUnsave(voucher.id)}
                disabled={isSaving}
                title="Bỏ lưu mã"
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
              {isSaving ? "Đang lưu..." : "Lưu vào ví"}
            </PrimaryButton>
          )
        ) : (
          <span className="text-sm text-slate-400">Đăng nhập để lưu mã</span>
        )}
      </div>
    </div>
  );
}
