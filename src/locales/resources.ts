import type { Resource } from 'i18next';

import {
  I18N_NAMESPACES,
  SUPPORTED_LANGUAGES,
  type I18nNamespace,
  type SupportedLanguage,
} from './config';

type LocalePayload = Record<string, unknown>;
type LocaleModules = Record<string, LocalePayload>;

const localeModules = import.meta.glob('./*/**/*.json', {
  eager: true,
  import: 'default',
}) as LocaleModules;

function createEmptyNamespaces(): Record<I18nNamespace, LocalePayload> {
  return Object.fromEntries(
    I18N_NAMESPACES.map((namespace) => [namespace, {}]),
  ) as Record<I18nNamespace, LocalePayload>;
}

function createEmptyResources(): Record<SupportedLanguage, Record<I18nNamespace, LocalePayload>> {
  return Object.fromEntries(
    SUPPORTED_LANGUAGES.map((language) => [language, createEmptyNamespaces()]),
  ) as Record<SupportedLanguage, Record<I18nNamespace, LocalePayload>>;
}

function resolveNamespace(relativePath: string): I18nNamespace | undefined {
  const namespace = relativePath.replace(/\.json$/, '').replace(/\//g, '.') as I18nNamespace;
  return I18N_NAMESPACES.includes(namespace) ? namespace : undefined;
}

const resources = createEmptyResources();

Object.entries(localeModules).forEach(([path, payload]) => {
  const match = path.match(/^\.\/([^/]+)\/(.+)\.json$/);
  if (!match) return;

  const [, language, namespacePath] = match;
  if (!SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) return;

  const namespace = resolveNamespace(namespacePath);
  if (!namespace) return;

  resources[language as SupportedLanguage][namespace] = payload;
});

export const i18nResources: Resource = resources;
