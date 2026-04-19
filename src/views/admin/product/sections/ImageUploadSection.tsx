import type { ChangeEvent, DragEvent } from "react";
import { FiTrash2, FiUploadCloud, FiLoader } from "react-icons/fi";
import type { ImageUploadSectionProps as Props } from "./types";
import { memo } from "react";
import { useTranslation } from "react-i18next";

export default memo(function ImageUploadSection(props: Props) {
  const { t } = useTranslation("adminCatalog");
  const {
    existingImages,
    pendingFiles,
    uploadingImages,
    isDragging, setIsDragging,
    fileInputRef,
    handleImageFiles,
    removePendingFile,
    deleteExistingImage,
  } = props;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{t("imageUpload.title")}</h2>
          {existingImages.length > 0 && (
            <span className="text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
              {t("imageUpload.count", { count: existingImages.length })}
            </span>
          )}
        </div>
        {uploadingImages && (
          <FiLoader className="animate-spin text-purple-500" />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(e.target.files || []);
          handleImageFiles(files);
          e.target.value = "";
        }}
      />

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setIsDragging(false);
          const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/"),
          );
          handleImageFiles(files);
        }}
        className={`border-2 border-dashed rounded-xl py-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging
            ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-[1.02]"
            : "border-slate-300 dark:border-slate-700 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${
            isDragging
              ? "bg-purple-100 dark:bg-purple-900/30 scale-110"
              : "bg-slate-100 dark:bg-slate-800"
          }`}
        >
          <FiUploadCloud
            className={`text-2xl ${isDragging ? "text-purple-500" : "text-slate-400"}`}
          />
        </div>
        <span className="font-semibold text-md text-slate-600 dark:text-slate-300">
          {isDragging
            ? t("imageUpload.dropActive")
            : t("imageUpload.dropIdle")}
        </span>
        <span className="text-sm text-slate-400 mt-1">
          {t("imageUpload.formatHint")}
        </span>
      </div>

      {/* Pending files preview (create mode) */}
      {pendingFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {pendingFiles.map((file, idx) => (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden group border border-amber-300 dark:border-amber-700 aspect-square bg-slate-100 dark:bg-slate-800"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Pending ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-10 font-bold bg-amber-500 text-white px-2 py-0.5 rounded-md shadow">
                {t("imageUpload.pendingBadge")}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePendingFile(idx);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
              >
                <FiTrash2 className="text-md" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Existing images (already uploaded to S3) */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {existingImages.map((img, idx) => (
            <div
              key={img.id}
              className="relative rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
            >
              <img
                src={img.imageUrl}
                alt={`Product ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && pendingFiles.length === 0 && (
                <span className="absolute top-2 left-2 text-10 font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-md shadow">
                  {t("imageUpload.primaryBadge")}
                </span>
              )}
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  await deleteExistingImage(img.id);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
              >
                <FiTrash2 className="text-md" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
