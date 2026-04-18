import { FiLoader, FiSave } from "react-icons/fi";
import { BackButton, Button, PrimaryButton } from "@/components";
import VariantSection from "./sections/VariantSection";
import useProductVariantsForm from "./hooks/useProductVariantsForm";

export default function ProductVariantsPage() {
  const form = useProductVariantsForm();

  if (form.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-3xl text-purple-500 animate-spin" />
          <span className="text-slate-500 font-medium">
            Đang tải phân loại sản phẩm...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <BackButton
            to={`/admin/products/${form.id}`}
            label="Quay lại thông tin sản phẩm"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Quản lý phân loại
            </h1>
            <p className="text-sm text-slate-500">
              {form.productName
                ? `${form.productName}${form.categoryName ? ` • ${form.categoryName}` : ""}`
                : "Cấu hình SKU, tồn kho, giá bán và ảnh theo phân loại."}
            </p>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto sm:gap-3">
          <Button
            href={`/admin/products/${form.id}`}
            variant="outline"
            size="md"
            className="flex-1 sm:flex-none"
          >
            Thông tin sản phẩm
          </Button>
          <PrimaryButton
            onClick={form.handleSubmit}
            disabled={form.saving}
            icon={form.saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            className="flex-1 sm:flex-none"
          >
            Lưu phân loại
          </PrimaryButton>
        </div>
      </div>

      {form.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-md text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {form.error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Phân loại luôn bám theo schema của danh mục. Nếu cần đổi danh mục, quay lại màn thông tin sản phẩm và xử lý danh mục trước khi chỉnh SKU.
      </div>

      <VariantSection
        variants={form.variants}
        variantSchema={form.variantSchema}
        uploadingVariantKeys={form.uploadingVariantKeys}
        variantFileInputRefs={form.variantFileInputRefs}
        addVariant={form.addVariant}
        generateVariantCombinations={form.generateVariantCombinations}
        sortVariantsByBestSelling={form.sortVariantsByBestSelling}
        removeVariant={form.removeVariant}
        updateVariant={form.updateVariant}
        updateVariantSelection={form.updateVariantSelection}
        regenerateVariantSku={form.regenerateVariantSku}
        getVariantUiKey={form.getVariantUiKey}
        handleVariantFilesSelected={form.handleVariantFilesSelected}
        removeVariantPendingFile={form.removeVariantPendingFile}
        deleteVariantImage={form.deleteVariantImage}
      />
    </div>
  );
}
