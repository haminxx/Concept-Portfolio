/* ══════════════════════════════════════════
   Map data — POIs, highlight areas, guides
   Seeded around UC San Diego / La Jolla.
   Extend POI_PLACES + HIGHLIGHT_AREAS freely.
   ══════════════════════════════════════════ */
import {
  UtensilsCrossed,
  Coffee,
  Trees,
  ShoppingCart,
  ShoppingBag,
  GraduationCap,
  Library,
  Plus,
  Fish,
  Landmark,
  Building2,
} from 'lucide-react'

/* Category → icon + color (Apple Maps palette) */
export const POI_CATEGORIES = {
  restaurant: { icon: UtensilsCrossed, color: '#FF9500' },
  cafe: { icon: Coffee, color: '#C8732B' },
  park: { icon: Trees, color: '#34C759' },
  grocery: { icon: ShoppingCart, color: '#F5A623' },
  shopping: { icon: ShoppingBag, color: '#5E5CE6' },
  education: { icon: GraduationCap, color: '#0A84FF' },
  library: { icon: Library, color: '#30B0C7' },
  medical: { icon: Plus, color: '#FF3B30' },
  aquarium: { icon: Fish, color: '#FF2D55' },
  landmark: { icon: Landmark, color: '#AF8E5B' },
  default: { icon: Building2, color: '#8E8E93' },
}

/* Minimum zoom at which POI icons appear on the map */
export const POI_MIN_ZOOM = 13

/* Seeded POIs (lng, lat). Replace / extend with your list. */
export const POI_PLACES = [
  { id: 'ucsd', name: 'UC San Diego', category: 'education', lng: -117.2340, lat: 32.8801 },
  { id: 'geisel', name: 'Geisel Library', category: 'library', lng: -117.2370, lat: 32.8811 },
  { id: 'rimac', name: 'RIMAC Arena', category: 'education', lng: -117.2415, lat: 32.8855 },
  { id: 'price-center', name: 'Price Center', category: 'shopping', lng: -117.2335, lat: 32.8794 },
  { id: 'salk', name: 'Salk Institute', category: 'landmark', lng: -117.2460, lat: 32.8870 },
  { id: 'birch', name: 'Birch Aquarium', category: 'aquarium', lng: -117.2510, lat: 32.8658 },
  { id: 'scripps-pier', name: 'Scripps Pier', category: 'landmark', lng: -117.2543, lat: 32.8669 },
  { id: 'torrey-beach', name: 'Torrey Pines City Beach', category: 'park', lng: -117.2570, lat: 32.8930 },
  { id: 'scripps-reserve', name: 'Scripps Coastal Reserve', category: 'park', lng: -117.2520, lat: 32.8700 },
  { id: 'pinpoint', name: 'Pinpoint Cafe', category: 'cafe', lng: -117.2300, lat: 32.8665 },
  { id: 'caroline', name: "Caroline's Seaside Cafe", category: 'cafe', lng: -117.2475, lat: 32.8662 },
  { id: 'wholefoods', name: 'Whole Foods Market', category: 'grocery', lng: -117.2240, lat: 32.8712 },
  { id: 'traderjoes', name: "Trader Joe's", category: 'grocery', lng: -117.2200, lat: 32.8700 },
  { id: 'urbanplates', name: 'Urban Plates', category: 'restaurant', lng: -117.2215, lat: 32.8706 },
  { id: 'regents-pizza', name: 'Regents Pizzeria', category: 'restaurant', lng: -117.2190, lat: 32.8665 },
  { id: 'vamedical', name: 'VA Medical Center', category: 'medical', lng: -117.2305, lat: 32.8720 },
]

/* Special highlighted marker (your personal pin) */
export const FEATURED_MARKER = {
  id: 'home',
  name: 'La Jolla',
  lng: -117.2280,
  lat: 32.8720,
  initials: 'C',
}

/* Highlighted areas (rendered as translucent fills) */
export const HIGHLIGHT_AREAS = [
  {
    id: 'ucsd-campus',
    name: 'UC San Diego',
    color: '#0A84FF',
    coordinates: [
      [
        [-117.2455, 32.8720],
        [-117.2235, 32.8720],
        [-117.2200, 32.8800],
        [-117.2255, 32.8910],
        [-117.2400, 32.8905],
        [-117.2470, 32.8820],
        [-117.2455, 32.8720],
      ],
    ],
  },
]

/* ── Guides (curated content; images via picsum seeds) ── */
const img = (seed, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const GUIDES_REGION = 'San Diego'

export const GUIDES_FEATURED = {
  brand: 'Natural Atlas',
  title: 'Seven Evening Hikes Near San Diego',
  image: img('sd-coast-hike', 900, 480),
}

export const GUIDES_SECTIONS = [
  {
    id: 'food',
    title: 'Food and Drink',
    cards: [
      { id: 'croissants', brand: 'INFATUATION', title: 'The Best Croissants Across America', image: img('croissant') },
      { id: 'brunch', brand: 'INFATUATION', title: 'The Best Brunch Spots in San Diego', image: img('brunch') },
      { id: 'tacos', brand: 'EATER', title: 'Essential Tacos in San Diego', image: img('tacos') },
    ],
  },
  {
    id: 'todo',
    title: 'Things to Do',
    cards: [
      { id: 'roadtrip', brand: 'viator', title: '9 Top California Road Trip Destinations', image: img('roadtrip') },
      { id: 'themeparks', brand: 'viator', title: 'Top Theme Parks in Southern California', image: img('themepark') },
      { id: 'beaches', brand: 'viator', title: 'Best Beaches in San Diego', image: img('beach') },
    ],
  },
  {
    id: 'travel',
    title: 'Travel',
    cards: [
      { id: 'spanish', brand: 'Tablet Hotels', title: "California's Spanish Revival Hotels", image: img('hotel-spanish') },
      { id: 'newhotels', brand: 'Tablet Hotels', title: 'The Best New Hotel Designs for 2026', image: img('hotel-modern') },
      { id: 'coastal', brand: 'Tablet Hotels', title: 'Coastal Escapes Worth the Drive', image: img('hotel-coast') },
    ],
  },
  {
    id: 'latest',
    title: 'Latest',
    cards: [
      { id: 'museums', brand: 'Balboa Park', title: 'A Day in Balboa Park Museums', image: img('museum') },
      { id: 'gaslamp', brand: 'INFATUATION', title: 'Where to Eat in the Gaslamp', image: img('gaslamp') },
      { id: 'sunset', brand: 'Natural Atlas', title: 'Best Sunset Viewpoints', image: img('sunset') },
    ],
  },
]
