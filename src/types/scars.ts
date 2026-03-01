// =================================================================
// SCAR SYSTEM — Permanent narrative consequences of dramatic choices
// =================================================================

export interface ScarEffect {
  id: string;
  /** Short display label, e.g. "Güven Yara İzi" */
  label: string;
  labelKey?: string;
  /** Longer description shown in GameOver screen */
  description: string;
  descriptionKey?: string;
  /** Event that granted this scar */
  sourceEventId: string;
  /** Player age when the scar was received */
  sourceAge: number;
  /**
   * Trait IDs shielded from removal while this scar persists.
   * Protective scars: keep hard-won traits despite adversity.
   * Trauma scars: keep negative traits despite recovery.
   */
  traitProtection?: string[];
}
