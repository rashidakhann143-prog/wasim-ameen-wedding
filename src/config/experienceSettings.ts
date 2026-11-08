/**
 * OWNER EXPERIENCE SETTINGS (Wasim & Ameen Wedding Invitation)
 * ============================================================
 * You can adjust these fixed settings here at any time in code:
 *
 * - ENABLE_BACKGROUND_MUSIC:
 *   When true, royal background celebration music automatically plays
 *   as soon as the guest taps the envelope for the first time.
 *   Guests have no control to turn it off.
 *
 * - ENABLE_FALLING_PETALS:
 *   When true, romantic falling rose petals remain automatically active
 *   for the entire guest experience.
 *   Guests have no control to turn them off.
 */

export interface ExperienceConfig {
  /** Automatically play royal background celebration music on first envelope tap */
  ENABLE_BACKGROUND_MUSIC: boolean;
  /** Automatically display romantic falling rose petals */
  ENABLE_FALLING_PETALS: boolean;
}

export const OWNER_EXPERIENCE_SETTINGS: ExperienceConfig = {
  // Fixed ON by default: Music begins on first envelope tap
  ENABLE_BACKGROUND_MUSIC: true,

  // Fixed ON by default: Petals continuously fall
  ENABLE_FALLING_PETALS: true,
};
