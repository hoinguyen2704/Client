import {
  FiLayers,
  FiList,
  FiLoader,
  FiPlus,
  FiSave,
  FiTag,
} from "react-icons/fi";
import {
  BackButton,
  Button,
  ExpandToggle,
  FormInput,
  SectionCard,
} from "@/components";
import { useTranslation } from "react-i18next";
import CategorySpecTemplatesSection from "./components/CategorySpecTemplatesSection";
import CategoryVariantAttributesSection from "./components/CategoryVariantAttributesSection";
import useCategoryForm from "./hooks/useCategoryForm";

export default function CategoryFormPage() {
  const { t } = useTranslation("adminCatalog");
  const form = useCategoryForm();

  if (form.loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="animate-spin text-3xl text-purple-500" />
          <span className="font-medium text-slate-500">
            {t("categories.form.loading")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <BackButton to="/admin/categories" label={t("categories.form.backToList")} />
          <h1 className="text-xl font-bold sm:text-2xl">
            {form.isEditMode
              ? t("categories.form.editTitle")
              : t("categories.form.createTitle")}
          </h1>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            href="/admin/categories"
            variant="outline"
            size="md"
            className="flex-1 sm:flex-none"
          >
            {t("categories.form.back")}
          </Button>
          <Button
            type="submit"
            form="category-form"
            size="md"
            className="flex-1 sm:flex-none"
            icon={<FiSave />}
            loading={form.saving}
          >
            {t("categories.form.save")}
          </Button>
        </div>
      </div>

      {form.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-md text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {form.error}
        </div>
      ) : null}

      <form
        id="category-form"
        onSubmit={form.handleSubmit}
        className="space-y-6"
      >
        <SectionCard
          title={t("categories.form.basicTitle")}
          description={t("categories.form.basicDescription")}
          icon={<FiTag className="text-xl text-purple-500" />}
          className="border-2 border-slate-200 dark:border-slate-700"
        >
          <div className="max-w-2xl">
            <FormInput
              label={t("categories.form.nameLabel")}
              type="text"
              placeholder={t("categories.form.namePlaceholder")}
              value={form.formData.name}
              onChange={(event) => form.setFormField("name", event.target.value)}
              required
              inputClassName="h-11 border-2 border-slate-200 dark:border-slate-700"
            />
          </div>
        </SectionCard>

        <SectionCard
          title={
            <div className="flex flex-wrap items-center gap-3">
              <span>{t("categories.form.variantTitle")}</span>
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {t("categories.form.variantCount", {
                  count: form.variantAttributes.length,
                })}
              </span>
            </div>
          }
          description={t("categories.form.variantDescription")}
          icon={<FiLayers className="text-xl text-indigo-500" />}
          action={
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                onClick={form.addVariantAttributeRow}
                variant="ghost"
                size="sm"
                icon={<FiPlus />}
                className="text-indigo-600"
              >
                {t("categories.form.variantAdd")}
              </Button>
              <ExpandToggle
                expanded={form.variantExpanded}
                onToggle={() => form.setVariantExpanded((prev) => !prev)}
                expandLabel={t("categories.form.expand")}
                collapseLabel={t("categories.form.collapse")}
              />
            </div>
          }
          contentClassName={form.variantExpanded ? "" : "hidden"}
          className="border-2 border-slate-200 dark:border-slate-700"
        >
          <CategoryVariantAttributesSection
            rows={form.variantAttributes}
            onAdd={form.addVariantAttributeRow}
            onRemove={form.removeVariantAttributeRow}
            onChange={form.updateVariantAttributeField}
          />
        </SectionCard>

        <SectionCard
          title={
            <div className="flex flex-wrap items-center gap-3">
              <span>{t("categories.form.specTitle")}</span>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {t("categories.form.specCount", {
                  count: form.specTemplates.length,
                })}
              </span>
            </div>
          }
          description={t("categories.form.specDescription")}
          icon={<FiList className="text-xl text-purple-500" />}
          action={
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                onClick={form.addSpecRow}
                variant="ghost"
                size="sm"
                icon={<FiPlus />}
                className="text-purple-600"
              >
                {t("categories.form.specAdd")}
              </Button>
              <ExpandToggle
                expanded={form.specExpanded}
                onToggle={() => form.setSpecExpanded((prev) => !prev)}
                expandLabel={t("categories.form.expand")}
                collapseLabel={t("categories.form.collapse")}
              />
            </div>
          }
          contentClassName={form.specExpanded ? "" : "hidden"}
          className="border-2 border-slate-200 dark:border-slate-700"
        >
          <CategorySpecTemplatesSection
            rows={form.specTemplates}
            onAdd={form.addSpecRow}
            onRemove={form.removeSpecRow}
            onChange={form.updateSpecRow}
          />
        </SectionCard>
      </form>
    </div>
  );
}
