import { AppLocale } from '../legacy';

export type Primitive = string | number | boolean;

export type NestedRecord = {
  [key: string]: Primitive | NestedRecord;
};

export type DomainStrings = Record<AppLocale, NestedRecord>;

export const emptyDomainStrings: DomainStrings = {
  tr: {},
  en: {},
};
