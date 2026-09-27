// ===== نرمال‌سازی متن =====
export const normalize = (str: unknown = ''): string =>
  String(str)
    .replace(/ي/g, 'ی') // ی عربی → فارسی
    .replace(/ك/g, 'ک') // ک عربی → فارسی
    .replace(/ة/g, 'ه') // ة → ه
    .replace(/ۀ/g, 'ه') // ۀ → ه
    .replace(/[ًٌٍَُِّْـ]/g, '') // حذف اعراب و کشیده
    .replace(/\s+/g, ' ') // چند فاصله → یک فاصله
    .trim();

// ===== تشخیص فارسی بودن =====
const PERSIAN_REGEX = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
export const isPersian = (str: string = ''): boolean => PERSIAN_REGEX.test(str);

// ===== Collator ها (یک‌بار ساخته میشن) =====
const faCollator = new Intl.Collator('fa-IR', { sensitivity: 'base', numeric: true });
const enCollator = new Intl.Collator('en-US', { sensitivity: 'base', numeric: true });

// ===== تایپ‌ها =====
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string | null | undefined ? K : never;
}[keyof T];

export interface SortByNameOptions<T> {
  /** نام فیلد یا تابع استخراج مقدار. پیش‌فرض: 'lastName' */
  key?: StringKeys<T> | ((item: T) => string | null | undefined);
  /** فیلد جایگزین اگه فیلد اصلی خالی بود */
  fallbackKey?: StringKeys<T>;
  /** ترتیب صعودی یا نزولی. پیش‌فرض: 'asc' */
  order?: 'asc' | 'desc';
  /** کپی بگیره یا آرایه اصلی رو تغییر بده. پیش‌فرض: true */
  immutable?: boolean;
}

// ===== تابع اصلی =====
export function sortByName<T extends Record<string, unknown>>(
  list: readonly T[] = [],
  options: SortByNameOptions<T> = {}
): T[] {
  const {
    key = 'lastName' as StringKeys<T>,
    fallbackKey,
    order = 'asc',
    immutable = true,
  } = options;

  const getRaw: (item: T) => string | null | undefined =
    typeof key === 'function'
      ? key
      : (item: T) => {
          const primary = item?.[key as keyof T];
          if (primary != null && String(primary).trim()) {
            return String(primary);
          }
          return fallbackKey ? (item?.[fallbackKey as keyof T] as string | null | undefined) : (primary as string | null | undefined);
        };

  const source: T[] = immutable ? [...list] : (list as T[]);
  const dir = order === 'desc' ? -1 : 1;

  return source.sort((a, b) => {
    const aName = normalize(getRaw(a) ?? '');
    const bName = normalize(getRaw(b) ?? '');

    // خالی‌ها آخر بیان
    if (!aName && bName) return 1;
    if (aName && !bName) return -1;
    if (!aName && !bName) return 0;

    const aIsFa = isPersian(aName);
    const bIsFa = isPersian(bName);

    // اول فارسی‌ها
    if (aIsFa !== bIsFa) return (aIsFa ? -1 : 1) * dir;

    // هم‌زبان → با collator مناسب
    const cmp = aIsFa
      ? faCollator.compare(aName, bName)
      : enCollator.compare(aName, bName);

    return cmp * dir;
  });
}
