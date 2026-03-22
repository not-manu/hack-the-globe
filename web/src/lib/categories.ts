export type CategoryInfo = {
  label: string
  img: string
}

/**
 * Material category metadata with curated Unsplash images.
 * Single source of truth — import this everywhere.
 */
export const CATEGORIES: Record<string, CategoryInfo> = {
  lumber: {
    label: 'Lumber',
    img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop',
  },
  steel: {
    label: 'Steel',
    img: 'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=800&h=800&fit=crop',
  },
  concrete: {
    label: 'Concrete',
    img: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=800&h=800&fit=crop',
  },
  brick: {
    label: 'Brick',
    img: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=800&h=800&fit=crop',
  },
  glass: {
    label: 'Glass',
    img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=800&fit=crop',
  },
  pipe: {
    label: 'Piping',
    img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
  },
  electrical: {
    label: 'Electrical',
    img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=800&fit=crop',
  },
  fixtures: {
    label: 'Fixtures',
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=800&fit=crop',
  },
  other: {
    label: 'Other',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop',
  },
}

/** Home page scan CTA background image */
export const SCAN_HERO_IMG =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop'

/** Get category info with fallback to 'other' */
export function getCategoryInfo(category: string): CategoryInfo {
  return CATEGORIES[category] ?? CATEGORIES.other
}

/** Get category image URL (small thumbnail size) */
export function getCategoryThumb(category: string): string {
  const cat = CATEGORIES[category] ?? CATEGORIES.other
  return cat.img.replace('w=800&h=800', 'w=200&h=200')
}
