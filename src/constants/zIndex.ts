/**
 * Centralized z-index management for consistent layering across the app.
 * Higher values appear above lower values.
 */
export const Z_INDEX = {
  /** Base content level */
  BASE: 0,

  /** Floating elements like FABs */
  FLOATING: 10,

  /** Sticky headers/footers */
  STICKY: 20,

  /** Dropdown menus, tooltips */
  DROPDOWN: 50,

  /** Event screen overlay */
  EVENT_OVERLAY: 100,

  /** Standard modals (SaveSlotPicker) */
  MODAL: 200,

  /** Nested modals (SaveExportModal inside SaveSlotPicker) */
  MODAL_NESTED: 250,

  /** Achievement list modal */
  MODAL_HIGH: 300,

  /** Settings button and critical UI */
  SETTINGS: 400,

  /** Toast notifications */
  TOAST: 500,

  /** Loading overlays */
  LOADING: 600,

  /** Maximum - emergency overlays only */
  MAX: 9999,
} as const;

export type ZIndexLevel = typeof Z_INDEX[keyof typeof Z_INDEX];
