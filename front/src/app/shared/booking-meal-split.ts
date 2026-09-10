/** True if tenant opening_hours JSON has any day with lunch/dinner break (hasBreak). */
export function tenantOpeningHoursHasMealSplit(openingHoursJson: string | null | undefined): boolean {
  if (!openingHoursJson?.trim()) return false;
  try {
    const oh = JSON.parse(openingHoursJson) as Record<string, { hasBreak?: boolean; closed?: boolean }>;
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    for (const d of days) {
      const day = oh[d];
      if (day && typeof day === 'object' && day.hasBreak && !day.closed) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
