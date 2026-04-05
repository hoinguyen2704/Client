export const RECENTLY_VIEWED_STORAGE_KEY = 'recently_viewed';
const MAX_RECENTLY_VIEWED = 50;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  viewedAt: string;
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is RecentlyViewedItem => Boolean(item?.id && item?.name && item?.slug));
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, 'viewedAt'>) {
  const current = getRecentlyViewed();
  const deduped = current.filter((entry) => entry.id !== item.id);
  const next: RecentlyViewedItem[] = [
    {
      ...item,
      viewedAt: new Date().toISOString(),
    },
    ...deduped,
  ].slice(0, MAX_RECENTLY_VIEWED);
  localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
}

export function clearRecentlyViewed() {
  localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
}

export function removeRecentlyViewed(itemId: string) {
  const current = getRecentlyViewed();
  const next = current.filter((entry) => entry.id !== itemId);
  localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
}
