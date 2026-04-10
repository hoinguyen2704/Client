import { FiChevronDown, FiCheck, FiStar } from "react-icons/fi";
import type { StatusPricingSectionProps as Props } from "./types";
import { memo } from "react";

export default memo(function StatusPricingSection(props: Props) {
  const {
    status, setStatus,
    originPrice, setOriginPrice,
    isFeatured, setIsFeatured,
    showStatusDropdown, setShowStatusDropdown,
    statusDropdownRef,
  } = props;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
      <h2 className="text-lg font-bold mb-4">Trạng thái & Giá</h2>

      <div>
        <label className="block font-medium mb-2">Trạng thái</label>
        <div className="relative" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  status === "ACTIVE"
                    ? "bg-emerald-500"
                    : status === "DRAFT"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                }`}
              />
              <span className="text-slate-900 dark:text-slate-100">
                {status === "ACTIVE"
                  ? "Đang bán"
                  : status === "DRAFT"
                    ? "Bản nháp"
                    : "Đã ẩn"}
              </span>
            </div>
            <FiChevronDown
              className={`text-slate-400 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showStatusDropdown && (
            <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden p-1">
              {[
                {
                  value: "ACTIVE",
                  label: "Đang bán",
                  color: "bg-emerald-500",
                },
                {
                  value: "DRAFT",
                  label: "Bản nháp",
                  color: "bg-amber-500",
                },
                {
                  value: "INACTIVE",
                  label: "Đã ẩn",
                  color: "bg-slate-400",
                },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    setStatus(opt.value);
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                    status === opt.value
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${opt.color} flex-shrink-0`}
                  />
                  <span className="flex-1">{opt.label}</span>
                  {status === opt.value && (
                    <FiCheck className="text-purple-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Giá gốc (VNĐ)</label>
        <input
          type="number"
          value={originPrice}
          onChange={(e) =>
            setOriginPrice(
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
          placeholder="0"
          className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-slate-400 mt-1">
          Giá sale/giảm giá nằm ở từng phân loại (Giá gốc so sánh)
        </p>
      </div>

      {/* Featured toggle */}
      <div>
        <label className="block font-medium mb-2">Sản phẩm nổi bật</label>
        <button
          type="button"
          onClick={() => setIsFeatured(!isFeatured)}
          className={`w-full h-12 px-4 rounded-xl flex items-center justify-between transition-colors ${
            isFeatured
              ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-300 dark:border-amber-700"
              : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiStar
              className={
                isFeatured
                  ? "text-amber-500 fill-amber-500"
                  : "text-slate-400"
              }
            />
            <span
              className={
                isFeatured
                  ? "text-amber-700 dark:text-amber-300 font-medium"
                  : "text-slate-500"
              }
            >
              {isFeatured ? "Đang hiện trên trang chủ" : "Không nổi bật"}
            </span>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors relative ${
              isFeatured
                ? "bg-amber-500"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                isFeatured ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
});
