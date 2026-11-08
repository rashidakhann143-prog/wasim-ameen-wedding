/**
 * Guest typography utilities for Card 1.
 * Provides overflow-safe, responsive scaling with customizable font size (slider + presets)
 * and support for Single Line or custom Double Line layouts.
 */

export type GuestFontSizePreset = 'sm' | 'md' | 'lg';

/**
 * Parses the size parameter from a URL (?size=sm | md | lg | 115)
 */
export function parseGuestScale(sizeParam: string | null | undefined): number {
  if (!sizeParam) return 1.0;
  const p = sizeParam.toLowerCase().trim();
  if (p === 'sm' || p === 'small') return 0.85;
  if (p === 'md' || p === 'medium') return 1.0;
  if (p === 'lg' || p === 'large') return 1.22;
  
  const num = parseFloat(p);
  if (!isNaN(num)) {
    // If passed as percentage like 85 or 120
    if (num > 10) {
      return Math.min(1.4, Math.max(0.7, num / 100));
    }
    // If passed as decimal like 1.15
    return Math.min(1.4, Math.max(0.7, num));
  }
  return 1.0;
}

/**
 * Computes responsive, overflow-safe inline styles for Card 1 on the main scroll and lightbox.
 * Automatically accommodates line breaks and adjusts boundaries so names never touch ornaments.
 */
export function getGuestNameInlineStyle(
  name: string,
  scale: number = 1.0,
  isSingleLine?: boolean
): { fontSize: string; lineHeight: number } {
  const clean = (name || '').trim();
  const lines = clean.split('\n').filter(l => l.length > 0);
  const maxLineLen = lines.length > 0 ? Math.max(...lines.map(l => l.trim().length)) : clean.length;
  const totalLen = clean.length;

  let minPx = 16;
  let vw = 4.4;
  let maxPx = 36;

  if (isSingleLine || lines.length <= 1) {
    if (totalLen > 38) {
      minPx = 11.5; vw = 2.9; maxPx = 23;
    } else if (totalLen > 26) {
      minPx = 13.5; vw = 3.5; maxPx = 28;
    } else if (totalLen > 18) {
      minPx = 15; vw = 4.0; maxPx = 32;
    } else {
      minPx = 18; vw = 4.8; maxPx = 39;
    }
  } else {
    // Double line or multiline
    if (maxLineLen <= 16) {
      minPx = 17; vw = 4.6; maxPx = 37;
    } else if (maxLineLen <= 26) {
      minPx = 15; vw = 4.1; maxPx = 33;
    } else if (maxLineLen <= 38) {
      minPx = 13; vw = 3.5; maxPx = 28;
    } else {
      minPx = 11.5; vw = 3.0; maxPx = 24;
    }
  }

  // Multiply by the user-selected scale (clamped to safety limits)
  const clampedScale = Math.min(1.4, Math.max(0.7, scale));
  const finalMin = Math.round(minPx * clampedScale * 10) / 10;
  const finalVw = Math.round(vw * clampedScale * 10) / 10;
  const finalMax = Math.round(maxPx * clampedScale);

  return {
    fontSize: `clamp(${finalMin}px, ${finalVw}vw, ${finalMax}px)`,
    lineHeight: lines.length > 1 ? 1.2 : 1.15,
  };
}

/**
 * Computes responsive styles for the smaller preview card emerging from the envelope.
 */
export function getEnvelopeGuestNameInlineStyle(
  name: string,
  scale: number = 1.0,
  isSingleLine?: boolean
): { fontSize: string; lineHeight: number } {
  const clean = (name || '').trim();
  const lines = clean.split('\n').filter(l => l.length > 0);
  const maxLineLen = lines.length > 0 ? Math.max(...lines.map(l => l.trim().length)) : clean.length;

  let minPx = 9.5;
  let vw = 2.4;
  let maxPx = 15;

  if (isSingleLine || lines.length <= 1) {
    if (clean.length > 30) {
      minPx = 7.5; vw = 1.8; maxPx = 11;
    } else if (clean.length > 18) {
      minPx = 9; vw = 2.2; maxPx = 13.5;
    } else {
      minPx = 11; vw = 2.8; maxPx = 17;
    }
  } else {
    if (maxLineLen <= 16) {
      minPx = 10.5; vw = 2.7; maxPx = 16;
    } else if (maxLineLen <= 26) {
      minPx = 9; vw = 2.3; maxPx = 14;
    } else {
      minPx = 8; vw = 2.0; maxPx = 12;
    }
  }

  const clampedScale = Math.min(1.4, Math.max(0.7, scale));
  const finalMin = Math.round(minPx * clampedScale * 10) / 10;
  const finalVw = Math.round(vw * clampedScale * 10) / 10;
  const finalMax = Math.round(maxPx * clampedScale * 10) / 10;

  return {
    fontSize: `clamp(${finalMin}px, ${finalVw}vw, ${finalMax}px)`,
    lineHeight: lines.length > 1 ? 1.2 : 1.15,
  };
}
