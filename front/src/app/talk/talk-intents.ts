/**
 * Client-side keyword → staff route map for Talk to POS (#344).
 * Navigation only — no mutations. Keep phrases short and ASCII-friendly.
 */

export interface TalkIntent {
  id: string;
  route: string;
  /** Lowercase substrings; first match wins (list order). */
  phrases: string[];
}

export const TALK_INTENTS: TalkIntent[] = [
  {
    id: 'kitchen',
    route: '/kitchen',
    phrases: ['kitchen', 'cocina', 'küche', 'kuche', 'kitchen display'],
  },
  {
    id: 'bar',
    route: '/bar',
    phrases: ['bar', 'beverages', 'bebidas', 'getränke', 'getranke', 'drinks'],
  },
  {
    id: 'tables',
    route: '/tables',
    phrases: ['tables', 'mesas', 'tische', 'floor', 'floor plan'],
  },
  {
    id: 'orders',
    route: '/staff/orders',
    phrases: ['orders', 'pedidos', 'bestellungen', 'order list'],
  },
  {
    id: 'reservations',
    route: '/reservations',
    phrases: ['reservations', 'reservation', 'reservas', 'reserva', 'booking', 'bookings'],
  },
  {
    id: 'my_shift',
    route: '/my-shift',
    phrases: ['my shift', 'shift', 'mi turno', 'meine schicht', 'clock in'],
  },
  {
    id: 'products',
    route: '/products',
    phrases: ['products', 'productos', 'produkte', 'menu items'],
  },
  {
    id: 'reports',
    route: '/reports',
    phrases: ['reports', 'report', 'informes', 'berichte', 'sales'],
  },
  {
    id: 'settings',
    route: '/settings',
    phrases: ['settings', 'ajustes', 'einstellungen', 'configuration'],
  },
  {
    id: 'dashboard',
    route: '/dashboard',
    phrases: ['dashboard', 'home', 'inicio', 'start', 'hauptseite'],
  },
];

export function normalizeTalkUtterance(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ');
}

/** Return the first intent whose phrase is contained in the normalized utterance. */
export function matchTalkIntent(utterance: string): TalkIntent | null {
  const text = normalizeTalkUtterance(utterance);
  if (!text) return null;
  for (const intent of TALK_INTENTS) {
    for (const phrase of intent.phrases) {
      const p = normalizeTalkUtterance(phrase);
      if (p && (text === p || text.includes(p))) {
        return intent;
      }
    }
  }
  return null;
}
