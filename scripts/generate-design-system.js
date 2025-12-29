const fs = require('fs');

// ============================================
// EXTRACTED TOKENS FROM OPENAI DESIGN SYSTEM
// ============================================

// Text Colors (4 base tokens)
const textColors = [
  { name: "color-text", light: "gray-1000", dark: "gray-1000" },
  { name: "color-text-secondary", light: "gray-500", dark: "gray-700" },
  { name: "color-text-tertiary", light: "gray-400", dark: "gray-600" },
  { name: "color-text-inverse", light: "gray-0", dark: "gray-0" }
];

// Semantic Colors (253 tokens) - extracted from website
const semanticColors = [
  // PRIMARY
  { name: "color-text-primary", light: "gray-1000", dark: "gray-1000" },
  { name: "color-background-primary-soft", light: "gray-100", dark: "gray-300" },
  { name: "color-background-primary-soft-hover", light: "gray-150", dark: "gray-350" },
  { name: "color-background-primary-soft-active", light: "gray-200", dark: "gray-400" },
  { name: "color-background-primary-soft-alpha", light: "alpha-08", dark: "alpha-12" },
  { name: "color-background-primary-soft-alpha-hover", light: "alpha-12", dark: "alpha-16" },
  { name: "color-background-primary-soft-alpha-active", light: "alpha-16", dark: "alpha-20" },
  { name: "color-text-primary-soft", light: "color-text", dark: "color-text" },
  { name: "color-background-primary-soft-alt", light: "alpha-02", dark: "alpha-02" },
  { name: "color-border-primary-soft-alt", light: "alpha-06", dark: "alpha-06" },
  { name: "color-text-primary-soft-alt", light: "color-text", dark: "color-text" },
  { name: "color-background-primary-surface", light: "alpha-05", dark: "alpha-08" },
  { name: "color-border-primary-surface", light: "alpha-05", dark: "alpha-08" },
  { name: "color-text-primary-surface", light: "color-text", dark: "color-text" },
  { name: "color-background-primary-solid", light: "gray-900", dark: "gray-950" },
  { name: "color-background-primary-solid-hover", light: "gray-700", dark: "gray-900" },
  { name: "color-background-primary-solid-active", light: "gray-600", dark: "gray-850" },
  { name: "color-text-primary-solid", light: "white", dark: "white" },
  { name: "color-background-primary-outline-hover", light: "alpha-02", dark: "alpha-04" },
  { name: "color-background-primary-outline-active", light: "alpha-04", dark: "alpha-06" },
  { name: "color-border-primary-outline", light: "alpha-16", dark: "alpha-25" },
  { name: "color-border-primary-outline-hover", light: "alpha-20", dark: "alpha-30" },
  { name: "color-text-primary-outline", light: "color-text", dark: "color-text" },
  { name: "color-text-primary-outline-hover", light: "color-text", dark: "color-text" },
  { name: "color-background-primary-ghost-hover", light: "alpha-08", dark: "alpha-12" },
  { name: "color-background-primary-ghost-active", light: "alpha-12", dark: "alpha-16" },
  { name: "color-text-primary-ghost", light: "color-text", dark: "color-text" },
  { name: "color-text-primary-ghost-hover", light: "color-text", dark: "color-text" },
  { name: "color-ring-primary", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-primary-soft", light: "color-ring-primary", dark: "color-ring-primary" },
  { name: "color-ring-primary-solid", light: "color-ring-primary", dark: "color-ring-primary" },
  { name: "color-ring-primary-outline", light: "color-ring-primary", dark: "color-ring-primary" },
  { name: "color-ring-primary-ghost", light: "color-ring-primary", dark: "color-ring-primary" },

  // SECONDARY
  { name: "color-background-secondary-soft", light: "gray-100", dark: "gray-300" },
  { name: "color-background-secondary-soft-hover", light: "gray-150", dark: "gray-350" },
  { name: "color-background-secondary-soft-active", light: "gray-200", dark: "gray-400" },
  { name: "color-background-secondary-soft-alpha", light: "alpha-08", dark: "alpha-12" },
  { name: "color-background-secondary-soft-alpha-hover", light: "alpha-12", dark: "alpha-16" },
  { name: "color-background-secondary-soft-alpha-active", light: "alpha-16", dark: "alpha-20" },
  { name: "color-text-secondary-soft", light: "color-text", dark: "color-text" },
  { name: "color-background-secondary-soft-alt", light: "alpha-02", dark: "alpha-02" },
  { name: "color-border-secondary-soft-alt", light: "alpha-06", dark: "alpha-06" },
  { name: "color-text-secondary-soft-alt", light: "color-text", dark: "color-text" },
  { name: "color-background-secondary-solid", light: "gray-500", dark: "gray-400" },
  { name: "color-background-secondary-solid-hover", light: "gray-600", dark: "gray-450" },
  { name: "color-background-secondary-solid-active", light: "gray-700", dark: "gray-500" },
  { name: "color-text-secondary-solid", light: "white", dark: "white" },
  { name: "color-background-secondary-outline-hover", light: "alpha-02", dark: "alpha-04" },
  { name: "color-background-secondary-outline-active", light: "alpha-04", dark: "alpha-06" },
  { name: "color-border-secondary-outline", light: "alpha-16", dark: "alpha-25" },
  { name: "color-border-secondary-outline-hover", light: "alpha-20", dark: "alpha-30" },
  { name: "color-text-secondary-outline", light: "color-text-secondary", dark: "color-text-secondary" },
  { name: "color-text-secondary-outline-hover", light: "color-text", dark: "color-text" },
  { name: "color-background-secondary-ghost-hover", light: "alpha-08", dark: "alpha-12" },
  { name: "color-background-secondary-ghost-active", light: "alpha-12", dark: "alpha-16" },
  { name: "color-text-secondary-ghost", light: "color-text-secondary", dark: "color-text-secondary" },
  { name: "color-text-secondary-ghost-hover", light: "color-text", dark: "color-text" },
  { name: "color-ring-secondary", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-secondary-soft", light: "color-ring-secondary", dark: "color-ring-secondary" },
  { name: "color-ring-secondary-solid", light: "color-ring-secondary", dark: "color-ring-secondary" },
  { name: "color-ring-secondary-outline", light: "color-ring-secondary", dark: "color-ring-secondary" },
  { name: "color-ring-secondary-ghost", light: "color-ring-secondary", dark: "color-ring-secondary" },

  // INFO
  { name: "color-text-info", light: "blue-700", dark: "blue-200" },
  { name: "color-background-info-soft", light: "blue-50", dark: "blue-50" },
  { name: "color-background-info-soft-hover", light: "blue-75", dark: "blue-75" },
  { name: "color-background-info-soft-active", light: "blue-75", dark: "blue-75" },
  { name: "color-background-info-soft-alpha", light: "blue-a50", dark: "blue-a50" },
  { name: "color-background-info-soft-alpha-hover", light: "blue-a75", dark: "blue-a75" },
  { name: "color-background-info-soft-alpha-active", light: "blue-a75", dark: "blue-a75" },
  { name: "color-text-info-soft", light: "blue-600", dark: "blue-300" },
  { name: "color-background-info-surface", light: "blue-a25", dark: "blue-a50" },
  { name: "color-border-info-surface", light: "blue-a25", dark: "blue-a50" },
  { name: "color-text-info-surface", light: "blue-600", dark: "blue-300" },
  { name: "color-background-info-solid", light: "blue-400", dark: "blue-400" },
  { name: "color-background-info-solid-hover", light: "blue-500", dark: "blue-500" },
  { name: "color-background-info-solid-active", light: "blue-500", dark: "blue-500" },
  { name: "color-text-info-solid", light: "white", dark: "white" },
  { name: "color-background-info-outline-hover", light: "blue-a25", dark: "blue-a25" },
  { name: "color-background-info-outline-active", light: "blue-a25", dark: "blue-a25" },
  { name: "color-border-info-outline", light: "blue-500", dark: "blue-500" },
  { name: "color-border-info-outline-hover", light: "blue-500", dark: "blue-500" },
  { name: "color-text-info-outline", light: "blue-500", dark: "blue-500" },
  { name: "color-text-info-outline-hover", light: "blue-500", dark: "blue-500" },
  { name: "color-background-info-ghost-hover", light: "blue-a50", dark: "blue-a50" },
  { name: "color-background-info-ghost-active", light: "blue-a50", dark: "blue-a50" },
  { name: "color-text-info-ghost", light: "blue-500", dark: "blue-200" },
  { name: "color-text-info-ghost-hover", light: "blue-500", dark: "blue-200" },
  { name: "color-ring-info", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-info-soft", light: "color-ring-info", dark: "color-ring-info" },
  { name: "color-ring-info-solid", light: "color-ring-info", dark: "color-ring-info" },
  { name: "color-ring-info-outline", light: "color-ring-info", dark: "color-ring-info" },
  { name: "color-ring-info-ghost", light: "color-ring-info", dark: "color-ring-info" },

  // WARNING
  { name: "color-text-warning", light: "orange-700", dark: "orange-500" },
  { name: "color-background-warning-soft", light: "orange-50", dark: "orange-50" },
  { name: "color-background-warning-soft-hover", light: "orange-75", dark: "orange-75" },
  { name: "color-background-warning-soft-active", light: "orange-75", dark: "orange-75" },
  { name: "color-background-warning-soft-alpha", light: "orange-a50", dark: "orange-a50" },
  { name: "color-background-warning-soft-alpha-hover", light: "orange-a75", dark: "orange-a75" },
  { name: "color-background-warning-soft-alpha-active", light: "orange-a75", dark: "orange-a75" },
  { name: "color-text-warning-soft", light: "orange-700", dark: "orange-400" },
  { name: "color-background-warning-surface", light: "orange-a25", dark: "orange-a50" },
  { name: "color-border-warning-surface", light: "orange-a25", dark: "orange-a50" },
  { name: "color-text-warning-surface", light: "orange-700", dark: "orange-400" },
  { name: "color-background-warning-solid", light: "orange-500", dark: "orange-500" },
  { name: "color-background-warning-solid-hover", light: "orange-600", dark: "orange-600" },
  { name: "color-background-warning-solid-active", light: "orange-600", dark: "orange-600" },
  { name: "color-text-warning-solid", light: "white", dark: "white" },
  { name: "color-background-warning-outline-hover", light: "orange-a25", dark: "orange-a25" },
  { name: "color-background-warning-outline-active", light: "orange-a25", dark: "orange-a25" },
  { name: "color-border-warning-outline", light: "orange-500", dark: "orange-500" },
  { name: "color-border-warning-outline-hover", light: "orange-500", dark: "orange-500" },
  { name: "color-text-warning-outline", light: "orange-500", dark: "orange-500" },
  { name: "color-text-warning-outline-hover", light: "orange-500", dark: "orange-500" },
  { name: "color-background-warning-ghost-hover", light: "orange-a50", dark: "orange-a50" },
  { name: "color-background-warning-ghost-active", light: "orange-a50", dark: "orange-a50" },
  { name: "color-text-warning-ghost", light: "orange-500", dark: "orange-500" },
  { name: "color-text-warning-ghost-hover", light: "orange-500", dark: "orange-500" },
  { name: "color-ring-warning", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-warning-soft", light: "color-ring-warning", dark: "color-ring-warning" },
  { name: "color-ring-warning-solid", light: "color-ring-warning", dark: "color-ring-warning" },
  { name: "color-ring-warning-outline", light: "color-ring-warning", dark: "color-ring-warning" },
  { name: "color-ring-warning-ghost", light: "color-ring-warning", dark: "color-ring-warning" },

  // CAUTION
  { name: "color-text-caution", light: "yellow-700", dark: "yellow-500" },
  { name: "color-background-caution-soft", light: "yellow-50", dark: "yellow-50" },
  { name: "color-background-caution-soft-hover", light: "yellow-75", dark: "yellow-75" },
  { name: "color-background-caution-soft-active", light: "yellow-75", dark: "yellow-75" },
  { name: "color-background-caution-soft-alpha", light: "yellow-a50", dark: "yellow-a50" },
  { name: "color-background-caution-soft-alpha-hover", light: "yellow-a75", dark: "yellow-a75" },
  { name: "color-background-caution-soft-alpha-active", light: "yellow-a75", dark: "yellow-a75" },
  { name: "color-text-caution-soft", light: "yellow-800", dark: "yellow-400" },
  { name: "color-background-caution-surface", light: "yellow-a25", dark: "yellow-a50" },
  { name: "color-border-caution-surface", light: "yellow-a25", dark: "yellow-a50" },
  { name: "color-text-caution-surface", light: "yellow-800", dark: "yellow-400" },
  { name: "color-background-caution-solid", light: "yellow-600", dark: "yellow-600" },
  { name: "color-background-caution-solid-hover", light: "yellow-700", dark: "yellow-700" },
  { name: "color-background-caution-solid-active", light: "yellow-700", dark: "yellow-700" },
  { name: "color-background-caution-outline-hover", light: "yellow-a25", dark: "yellow-a25" },
  { name: "color-background-caution-outline-active", light: "yellow-a25", dark: "yellow-a25" },
  { name: "color-border-caution-outline", light: "yellow-700", dark: "yellow-700" },
  { name: "color-border-caution-outline-hover", light: "yellow-700", dark: "yellow-700" },
  { name: "color-text-caution-outline", light: "yellow-700", dark: "yellow-700" },
  { name: "color-text-caution-outline-hover", light: "yellow-700", dark: "yellow-700" },
  { name: "color-background-caution-ghost-hover", light: "yellow-a50", dark: "yellow-a50" },
  { name: "color-background-caution-ghost-active", light: "yellow-a50", dark: "yellow-a50" },
  { name: "color-text-caution-ghost", light: "yellow-700", dark: "yellow-700" },
  { name: "color-text-caution-ghost-hover", light: "yellow-700", dark: "yellow-700" },
  { name: "color-ring-caution", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-caution-soft", light: "color-ring-caution", dark: "color-ring-caution" },
  { name: "color-ring-caution-solid", light: "color-ring-caution", dark: "color-ring-caution" },
  { name: "color-ring-caution-outline", light: "color-ring-caution", dark: "color-ring-caution" },
  { name: "color-ring-caution-ghost", light: "color-ring-caution", dark: "color-ring-caution" },

  // DANGER
  { name: "color-text-danger", light: "red-700", dark: "red-500" },
  { name: "color-background-danger-soft", light: "red-50", dark: "red-50" },
  { name: "color-background-danger-soft-hover", light: "red-75", dark: "red-75" },
  { name: "color-background-danger-soft-active", light: "red-75", dark: "red-75" },
  { name: "color-background-danger-soft-alpha", light: "red-a50", dark: "red-a50" },
  { name: "color-background-danger-soft-alpha-hover", light: "red-a75", dark: "red-a75" },
  { name: "color-background-danger-soft-alpha-active", light: "red-a75", dark: "red-a75" },
  { name: "color-text-danger-soft", light: "red-600", dark: "red-400" },
  { name: "color-background-danger-surface", light: "red-a25", dark: "red-a50" },
  { name: "color-border-danger-surface", light: "red-a25", dark: "red-a50" },
  { name: "color-text-danger-surface", light: "red-600", dark: "red-400" },
  { name: "color-background-danger-solid", light: "red-500", dark: "red-500" },
  { name: "color-background-danger-solid-hover", light: "red-600", dark: "red-600" },
  { name: "color-background-danger-solid-active", light: "red-600", dark: "red-600" },
  { name: "color-text-danger-solid", light: "white", dark: "white" },
  { name: "color-background-danger-outline-hover", light: "red-a25", dark: "red-a25" },
  { name: "color-background-danger-outline-active", light: "red-a25", dark: "red-a25" },
  { name: "color-border-danger-outline", light: "red-500", dark: "red-500" },
  { name: "color-border-danger-outline-hover", light: "red-500", dark: "red-500" },
  { name: "color-text-danger-outline", light: "red-500", dark: "red-500" },
  { name: "color-text-danger-outline-hover", light: "red-500", dark: "red-500" },
  { name: "color-background-danger-ghost-hover", light: "red-a50", dark: "red-a50" },
  { name: "color-background-danger-ghost-active", light: "red-a50", dark: "red-a50" },
  { name: "color-text-danger-ghost", light: "red-500", dark: "red-500" },
  { name: "color-text-danger-ghost-hover", light: "red-500", dark: "red-500" },
  { name: "color-ring-danger", light: "red-200", dark: "red-200" },
  { name: "color-ring-danger-soft", light: "color-ring-danger", dark: "color-ring-danger" },
  { name: "color-ring-danger-solid", light: "color-ring-danger", dark: "color-ring-danger" },
  { name: "color-ring-danger-outline", light: "color-ring-danger", dark: "color-ring-danger" },
  { name: "color-ring-danger-ghost", light: "color-ring-danger", dark: "color-ring-danger" },

  // SUCCESS
  { name: "color-text-success", light: "green-700", dark: "green-400" },
  { name: "color-background-success-soft", light: "green-50", dark: "green-50" },
  { name: "color-background-success-soft-hover", light: "green-75", dark: "green-75" },
  { name: "color-background-success-soft-active", light: "green-75", dark: "green-75" },
  { name: "color-background-success-soft-alpha", light: "green-a50", dark: "green-a50" },
  { name: "color-background-success-soft-alpha-hover", light: "green-a75", dark: "green-a75" },
  { name: "color-background-success-soft-alpha-active", light: "green-a75", dark: "green-a75" },
  { name: "color-text-success-soft", light: "green-600", dark: "green-400" },
  { name: "color-background-success-surface", light: "green-a25", dark: "green-a50" },
  { name: "color-border-success-surface", light: "green-a25", dark: "green-a50" },
  { name: "color-text-success-surface", light: "green-600", dark: "green-400" },
  { name: "color-background-success-solid", light: "green-400", dark: "green-400" },
  { name: "color-background-success-solid-hover", light: "green-500", dark: "green-500" },
  { name: "color-background-success-solid-active", light: "green-500", dark: "green-500" },
  { name: "color-text-success-solid", light: "white", dark: "white" },
  { name: "color-background-success-outline-hover", light: "green-a25", dark: "green-a25" },
  { name: "color-background-success-outline-active", light: "green-a25", dark: "green-a25" },
  { name: "color-border-success-outline", light: "green-500", dark: "green-500" },
  { name: "color-border-success-outline-hover", light: "green-500", dark: "green-500" },
  { name: "color-text-success-outline", light: "green-500", dark: "green-500" },
  { name: "color-text-success-outline-hover", light: "green-500", dark: "green-500" },
  { name: "color-background-success-ghost-hover", light: "green-a50", dark: "green-a50" },
  { name: "color-background-success-ghost-active", light: "green-a50", dark: "green-a50" },
  { name: "color-text-success-ghost", light: "green-500", dark: "green-500" },
  { name: "color-text-success-ghost-hover", light: "green-500", dark: "green-500" },
  { name: "color-ring-success", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-success-soft", light: "color-ring-info", dark: "color-ring-info" },
  { name: "color-ring-success-solid", light: "color-ring-info", dark: "color-ring-info" },
  { name: "color-ring-success-outline", light: "color-ring-info", dark: "color-ring-info" },
  { name: "color-ring-success-ghost", light: "color-ring-info", dark: "color-ring-info" },

  // DISCOVERY
  { name: "color-text-discovery", light: "purple-700", dark: "purple-500" },
  { name: "color-background-discovery-soft", light: "purple-50", dark: "purple-50" },
  { name: "color-background-discovery-soft-hover", light: "purple-75", dark: "purple-75" },
  { name: "color-background-discovery-soft-active", light: "purple-75", dark: "purple-75" },
  { name: "color-background-discovery-soft-alpha", light: "purple-a50", dark: "purple-a50" },
  { name: "color-background-discovery-soft-alpha-hover", light: "purple-a75", dark: "purple-a75" },
  { name: "color-background-discovery-soft-alpha-active", light: "purple-a75", dark: "purple-a75" },
  { name: "color-text-discovery-soft", light: "purple-600", dark: "purple-300" },
  { name: "color-background-discovery-surface", light: "purple-a25", dark: "purple-a50" },
  { name: "color-border-discovery-surface", light: "purple-a25", dark: "purple-a50" },
  { name: "color-text-discovery-surface", light: "purple-600", dark: "purple-200" },
  { name: "color-background-discovery-solid", light: "purple-400", dark: "purple-400" },
  { name: "color-background-discovery-solid-hover", light: "purple-500", dark: "purple-500" },
  { name: "color-background-discovery-solid-active", light: "purple-500", dark: "purple-500" },
  { name: "color-text-discovery-solid", light: "white", dark: "white" },
  { name: "color-background-discovery-outline-hover", light: "purple-a25", dark: "purple-a25" },
  { name: "color-background-discovery-outline-active", light: "purple-a25", dark: "purple-a25" },
  { name: "color-border-discovery-outline", light: "purple-500", dark: "purple-500" },
  { name: "color-border-discovery-outline-hover", light: "purple-500", dark: "purple-500" },
  { name: "color-text-discovery-outline", light: "purple-500", dark: "purple-500" },
  { name: "color-text-discovery-outline-hover", light: "purple-500", dark: "purple-500" },
  { name: "color-background-discovery-ghost-hover", light: "purple-a50", dark: "purple-a50" },
  { name: "color-background-discovery-ghost-active", light: "purple-a50", dark: "purple-a50" },
  { name: "color-text-discovery-ghost", light: "purple-500", dark: "purple-500" },
  { name: "color-text-discovery-ghost-hover", light: "purple-500", dark: "purple-500" },
  { name: "color-ring-discovery", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-discovery-soft", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-discovery-solid", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-discovery-outline", light: "color-ring", dark: "color-ring" },
  { name: "color-ring-discovery-ghost", light: "color-ring", dark: "color-ring" },

  // DISABLED
  { name: "color-background-disabled", light: "alpha-05", dark: "alpha-05" },
  { name: "color-border-disabled", light: "alpha-06", dark: "alpha-06" },
  { name: "color-text-disabled", light: "gray-400", dark: "gray-500" },

  // GLOBAL
  { name: "color-ring", light: "blue-500", dark: "blue-400" },
  { name: "color-border", light: "alpha-10", dark: "alpha-12" },
  { name: "color-border-subtle", light: "alpha-05", dark: "alpha-06" },
  { name: "color-border-strong", light: "alpha-15", dark: "alpha-20" },
  { name: "color-surface", light: "gray-0", dark: "gray-200" },
  { name: "color-surface-secondary", light: "gray-50", dark: "gray-100" },
  { name: "color-surface-tertiary", light: "gray-75", dark: "gray-50" },
  { name: "color-surface-elevated", light: "gray-0", dark: "gray-300" },
  { name: "color-surface-elevated-secondary", light: "gray-50", dark: "gray-400" }
];

// Combine all tokens
const allTokens = [...textColors, ...semanticColors];

// ============================================
// ALIAS RESOLUTION
// ============================================

// Base aliases map (tokens that reference other semantic tokens)
const baseAliases = {
  'color-text': { light: 'gray.1000', dark: 'gray.1000' },
  'color-text-secondary': { light: 'gray.500', dark: 'gray.700' },
  'color-text-tertiary': { light: 'gray.400', dark: 'gray.600' },
  'color-ring': { light: 'blue.500', dark: 'blue.400' },
  'color-ring-primary': { light: 'blue.500', dark: 'blue.400' },
  'color-ring-secondary': { light: 'blue.500', dark: 'blue.400' },
  'color-ring-info': { light: 'blue.500', dark: 'blue.400' },
  'color-ring-warning': { light: 'blue.500', dark: 'blue.400' },
  'color-ring-caution': { light: 'blue.500', dark: 'blue.400' },
  'color-ring-success': { light: 'blue.500', dark: 'blue.400' },
  'color-ring-discovery': { light: 'blue.500', dark: 'blue.400' },
  'color-ring-danger': { light: 'red.200', dark: 'red.200' }
};

// Gray scale mirror map for Dark mode
const GRAY_MIRROR = {
  '0': '1000', '25': '975', '50': '950', '75': '925',
  '100': '900', '150': '850', '200': '800', '250': '750',
  '300': '700', '350': '650', '400': '600', '450': '550',
  '500': '500', '550': '450', '600': '400', '650': '350',
  '700': '300', '750': '250', '800': '200', '850': '150',
  '900': '100', '925': '75', '950': '50', '975': '25', '1000': '0'
};

// Mirror gray key for Dark mode (gray.1000 → gray.0)
function mirrorGrayForDark(primitiveRef) {
  const match = primitiveRef.match(/^gray\.(\d+)$/);
  if (match && GRAY_MIRROR[match[1]]) {
    return `gray.${GRAY_MIRROR[match[1]]}`;
  }
  return primitiveRef;
}

// Convert alpha to alpha-white for Dark mode (ALWAYS, regardless of values)
function alphaToWhiteForDark(primitiveRef) {
  if (primitiveRef.startsWith('alpha.')) {
    return primitiveRef.replace('alpha.', 'alpha-white.');
  }
  return primitiveRef;
}

// Convert token value to primitive reference
function toPrimitive(value) {
  if (value === 'white') return 'base.white';
  if (value === 'black') return 'base.black';
  // gray-500 → gray.500, blue-a25 → blue.a25, alpha-08 → alpha.08
  return value.replace('-', '.');
}

// Resolve alias recursively
function resolveAlias(value, mode) {
  // If it's a semantic token reference (starts with color-)
  if (value.startsWith('color-')) {
    // Check if we have it in base aliases
    if (baseAliases[value]) {
      return baseAliases[value][mode];
    }
    // Otherwise look for the parent token
    const parentToken = allTokens.find(t => t.name === value);
    if (parentToken) {
      return resolveAlias(parentToken[mode], mode);
    }
    console.warn(`Unknown alias: ${value}`);
    return value;
  }
  // It's a primitive reference
  return toPrimitive(value);
}

// ============================================
// COLOR PRIMITIVES
// ============================================

const grayScale = {
  "0": "#ffffff", "25": "#fcfcfc", "50": "#f9f9f9", "75": "#f3f3f3",
  "100": "#ededed", "150": "#dfdfdf", "200": "#cdcdcd", "250": "#b9b9b9",
  "300": "#afafaf", "350": "#9f9f9f", "400": "#8f8f8f", "450": "#767676",
  "500": "#5d5d5d", "550": "#4f4f4f", "600": "#414141", "650": "#393939",
  "700": "#303030", "750": "#282828", "800": "#212121", "850": "#1c1c1c",
  "900": "#181818", "925": "#161616", "950": "#131313", "975": "#101010",
  "1000": "#0d0d0d"
};

const alphaValues = {
  "00": 0, "02": 0.02, "04": 0.04, "05": 0.05, "06": 0.06, "08": 0.08,
  "10": 0.1, "12": 0.12, "15": 0.15, "16": 0.16, "20": 0.2, "25": 0.25,
  "30": 0.3, "35": 0.35, "40": 0.4, "50": 0.5
};

const primaryColors = {
  red: {
    "25": "#fff0f0", "50": "#ffd9d9", "75": "#ffc6c5", "100": "#ffa4a2",
    "200": "#ff8583", "300": "#ff6764", "400": "#fa423e", "500": "#e02e2a",
    "600": "#c11713", "700": "#9c0600", "800": "#6e0400", "900": "#4a0300",
    "950": "#340200", "1000": "#1f0101",
    "a25": "rgba(224, 46, 42, 0.08)", "a50": "rgba(224, 46, 42, 0.16)",
    "a75": "rgba(224, 46, 42, 0.24)", "a100": "rgba(224, 46, 42, 0.32)",
    "a200": "rgba(224, 46, 42, 0.48)", "a300": "rgba(224, 46, 42, 0.64)"
  },
  orange: {
    "25": "#fff3eb", "50": "#ffe0cc", "75": "#ffcfb0", "100": "#ffb384",
    "200": "#ff9758", "300": "#ff7b2b", "400": "#f56300", "500": "#c54f00",
    "600": "#9c3f00", "700": "#793100", "800": "#562300", "900": "#3a1800",
    "950": "#281000", "1000": "#180a00",
    "a25": "rgba(197, 79, 0, 0.08)", "a50": "rgba(197, 79, 0, 0.16)",
    "a75": "rgba(197, 79, 0, 0.24)", "a100": "rgba(197, 79, 0, 0.32)",
    "a200": "rgba(197, 79, 0, 0.48)", "a300": "rgba(197, 79, 0, 0.64)"
  },
  yellow: {
    "25": "#fef9eb", "50": "#fcefcc", "75": "#fae6af", "100": "#f5d782",
    "200": "#f0c855", "300": "#eaba28", "400": "#d9a800", "500": "#ad8600",
    "600": "#876900", "700": "#685100", "800": "#4b3b00", "900": "#332800",
    "950": "#241c00", "1000": "#161100",
    "a25": "rgba(173, 134, 0, 0.08)", "a50": "rgba(173, 134, 0, 0.16)",
    "a75": "rgba(173, 134, 0, 0.24)", "a100": "rgba(173, 134, 0, 0.32)",
    "a200": "rgba(173, 134, 0, 0.48)", "a300": "rgba(173, 134, 0, 0.64)"
  },
  green: {
    "25": "#e9fcf2", "50": "#c7f7de", "75": "#a8f1cb", "100": "#76e6ac",
    "200": "#45db8e", "300": "#15cf70", "400": "#00b85a", "500": "#009348",
    "600": "#007439", "700": "#005a2c", "800": "#004120", "900": "#002c16",
    "950": "#001f0f", "1000": "#001309",
    "a25": "rgba(0, 147, 72, 0.08)", "a50": "rgba(0, 147, 72, 0.16)",
    "a75": "rgba(0, 147, 72, 0.24)", "a100": "rgba(0, 147, 72, 0.32)",
    "a200": "rgba(0, 147, 72, 0.48)", "a300": "rgba(0, 147, 72, 0.64)"
  },
  blue: {
    "25": "#eef6ff", "50": "#d4eaff", "75": "#bddeff", "100": "#97cbff",
    "200": "#70b7ff", "300": "#4aa4ff", "400": "#2491ff", "500": "#0073e6",
    "600": "#005bbb", "700": "#004691", "800": "#003269", "900": "#002349",
    "950": "#001833", "1000": "#000e1f",
    "a25": "rgba(0, 115, 230, 0.08)", "a50": "rgba(0, 115, 230, 0.16)",
    "a75": "rgba(0, 115, 230, 0.24)", "a100": "rgba(0, 115, 230, 0.32)",
    "a200": "rgba(0, 115, 230, 0.48)", "a300": "rgba(0, 115, 230, 0.64)"
  },
  purple: {
    "25": "#f8f0ff", "50": "#eed9ff", "75": "#e5c6ff", "100": "#d6a4ff",
    "200": "#c782ff", "300": "#b85fff", "400": "#a939ff", "500": "#8d0ee3",
    "600": "#6f00b8", "700": "#55008e", "800": "#3c0066", "900": "#290047",
    "950": "#1d0033", "1000": "#11001f",
    "a25": "rgba(141, 14, 227, 0.08)", "a50": "rgba(141, 14, 227, 0.16)",
    "a75": "rgba(141, 14, 227, 0.24)", "a100": "rgba(141, 14, 227, 0.32)",
    "a200": "rgba(141, 14, 227, 0.48)", "a300": "rgba(141, 14, 227, 0.64)"
  }
};

// Build primitive token with description
const createPrimitive = (value, tokenName) => ({
  "$scopes": ["ALL_SCOPES"],
  "$hiddenFromPublishing": true,
  "$description": `--${tokenName}\n${tokenName}`,
  "$type": "color",
  "$value": value
});

// Sort numeric keys properly (00, 02, 04... not "10" < "02" lexicographically)
// Returns array of [key, value] pairs in sorted order for use with reduce
function buildSortedNumericObject(entries) {
  return entries
    .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
    .reduce((acc, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {});
}

// Build gray scale object (sorted numerically)
const grayPrimitives = buildSortedNumericObject(
  Object.entries(grayScale).map(([key, val]) => [key, createPrimitive(val, `gray-${key}`)])
);

// Build alpha values (black-based for Light mode)
const alphaPrimitives = buildSortedNumericObject(
  Object.entries(alphaValues).map(([key, opacity]) => [key, createPrimitive(`rgba(0, 0, 0, ${opacity})`, `alpha-${key}`)])
);

// Build alpha-white values (white-based for Dark mode)
const alphaWhitePrimitives = buildSortedNumericObject(
  Object.entries(alphaValues).map(([key, opacity]) => [key, createPrimitive(`rgba(255, 255, 255, ${opacity})`, `alpha-white-${key}`)])
);

// Build Color Primitive collection (single mode: Value)
const colorPrimitive = {
  "color primitive": {
    "modes": {
      "Value": {
        "base": {
          "white": createPrimitive("#ffffff", "base-white"),
          "black": createPrimitive("#000000", "base-black")
        },
        "gray": grayPrimitives,
        "alpha": alphaPrimitives,
        "alpha-white": alphaWhitePrimitives,
        ...Object.fromEntries(
          Object.entries(primaryColors).map(([name, values]) => [
            name,
            Object.fromEntries(
              Object.entries(values).map(([key, val]) => [key, createPrimitive(val, `${name}-${key}`)])
            )
          ])
        )
      }
    }
  }
};

// ============================================
// SEMANTIC TOKENS (Color collection)
// ============================================

const TEXT_FILL = ["TEXT_FILL"];
const FRAME_FILL = ["FRAME_FILL", "SHAPE_FILL"];
const STROKE = ["STROKE_COLOR"];
const EFFECT = ["EFFECT_COLOR"];

// Get scope based on token name
function getScope(name) {
  if (name.includes('-text-') || name === 'color-text') return TEXT_FILL;
  if (name.includes('-background-')) return FRAME_FILL;
  if (name.includes('-border-') || name === 'color-border') return STROKE;
  if (name.includes('-ring-') || name === 'color-ring') return EFFECT;
  if (name.includes('-surface')) return FRAME_FILL;
  return FRAME_FILL;
}

// Token classification
const CATEGORIES = ['text', 'background', 'border', 'ring', 'surface'];
const COLORS = ['primary', 'secondary', 'info', 'warning', 'caution', 'danger', 'success', 'discovery'];
const STYLES = ['soft', 'solid', 'surface', 'outline', 'ghost'];
const MODIFIERS = ['hover', 'active', 'alt', 'alpha', 'elevated'];
// Simple tokens that go directly at top level without nesting
const SIMPLE_TOKENS = ['tertiary', 'inverse', 'disabled', 'default', 'subtle', 'strong'];

// Parse token name into path with style-first grouping
// Example: color-background-primary-soft-hover → [background, soft, hover, primary]
function getPath(name) {
  const withoutPrefix = name.replace(/^color-/, '');
  const parts = withoutPrefix.split('-');
  
  if (!CATEGORIES.includes(parts[0])) {
    return [withoutPrefix];
  }
  
  const category = parts[0];
  const rest = parts.slice(1);
  
  // Base category token (color-text, color-ring) → category.default
  if (rest.length === 0) {
    return [category, 'default'];
  }
  
  // Find color, style, and modifiers in the remaining parts
  let color = null;
  let style = null;
  const modifiers = [];
  const other = [];
  
  for (const part of rest) {
    if (COLORS.includes(part) && !color) {
      color = part;
    } else if (STYLES.includes(part) && !style) {
      style = part;
    } else if (MODIFIERS.includes(part)) {
      modifiers.push(part);
    } else {
      other.push(part);
    }
  }
  
  // Build path: category → style → modifiers → color
  const path = [category];
  
  if (style) {
    path.push(style);
    // Add modifiers as nested folders
    modifiers.forEach(m => path.push(m));
    // Color at the end
    if (color) {
      path.push(color);
    }
  } else if (color) {
    // No style, modifiers go before color (e.g., color-surface-elevated-secondary → surface.elevated.secondary)
    modifiers.forEach(m => path.push(m));
    other.forEach(o => path.push(o));
    path.push(color);
  } else if (modifiers.length > 0) {
    // Has modifiers without color (e.g., color-surface-elevated → surface.elevated.default)
    modifiers.forEach(m => path.push(m));
    other.forEach(o => path.push(o));
    path.push('default');
  } else if (other.length > 0) {
    // Simple tokens without style/color (e.g., color-text-tertiary → text.tertiary)
    // Check if all parts are simple tokens - no nesting needed
    const allSimple = other.every(o => SIMPLE_TOKENS.includes(o));
    if (allSimple) {
      path.push(other.join('-'));
    } else {
      other.forEach(o => path.push(o));
      path.push('default');
    }
  } else {
    // No color, no style (e.g., color-text-secondary, color-text-disabled)
    path.push(rest.join('-'));
  }
  
  return path;
}

// Create semantic token
// Generate description based on token name structure
function generateDescription(tokenName) {
  // Parse: color-{category}-{color}-{variant}-{state}
  const parts = tokenName.replace(/^color-/, '').split('-');
  
  const category = parts[0]; // text, background, border, ring, surface
  const rest = parts.slice(1);
  
  // Find color, variant, state
  const colors = ['primary', 'secondary', 'info', 'warning', 'caution', 'danger', 'success', 'discovery'];
  const variants = ['soft', 'solid', 'surface', 'outline', 'ghost'];
  const states = ['hover', 'active', 'alt', 'alpha'];
  
  let color = null, variant = null, state = [], other = [];
  
  for (const part of rest) {
    if (colors.includes(part)) color = part;
    else if (variants.includes(part)) variant = part;
    else if (states.includes(part)) state.push(part);
    else other.push(part);
  }
  
  // Build description
  let desc = '';
  
  if (category === 'text') {
    // Base text tokens (no variant = not a component)
    const baseTextTypes = ['secondary', 'tertiary', 'inverse', 'disabled'];
    if (rest.length === 0) {
      desc = 'Page text, paragraphs, headings';
    } else if (rest.length === 1 && baseTextTypes.includes(rest[0])) {
      if (rest[0] === 'secondary') desc = 'Secondary text, less emphasis';
      else if (rest[0] === 'tertiary') desc = 'Tertiary text, subtle';
      else if (rest[0] === 'inverse') desc = 'Text on inverted backgrounds';
      else if (rest[0] === 'disabled') desc = 'Disabled text state';
    } else if (color && !variant) {
      // Base semantic color (color-text-primary, color-text-info, etc.)
      desc = `Text in components with color="${color}"`;
    } else {
      // Component text - surface variant is for Alert/Badge, others for Button
      const component = variant === 'surface' ? 'Alert/Badge' : 'Button';
      desc = `${component} ${color || 'primary'} ${variant || 'default'} text`;
      if (state.length) desc += ` ${state.join(' ')}`;
    }
  } else if (category === 'background') {
    if (rest.includes('disabled')) desc = 'Disabled background state';
    else {
      // Component background - surface variant is for Alert/Badge, others for Button
      const component = variant === 'surface' ? 'Alert/Badge' : 'Button';
      desc = `${component} ${color || 'primary'} ${variant || 'default'} background`;
      if (state.length) desc += ` ${state.join(' ')}`;
    }
  } else if (category === 'border') {
    if (rest.length === 0) desc = 'Default border color';
    else if (rest.length === 1 && rest[0] === 'subtle') desc = 'Subtle border, low contrast';
    else if (rest.length === 1 && rest[0] === 'strong') desc = 'Strong border, high contrast';
    else if (rest.includes('disabled')) desc = 'Disabled border state';
    else {
      // Component border - surface variant is for Alert/Badge, others for Button
      const component = variant === 'surface' ? 'Alert/Badge' : 'Button';
      desc = `${component} ${color || 'primary'} ${variant || 'default'} border`;
      if (state.length) desc += ` ${state.join(' ')}`;
    }
  } else if (category === 'ring') {
    if (rest.length === 0) {
      desc = 'Default focus ring';
    } else if (color && !variant) {
      // Base semantic ring (color-ring-primary, color-ring-danger)
      desc = `${color.charAt(0).toUpperCase() + color.slice(1)} focus ring`;
    } else {
      desc = `Button ${color || 'primary'} ${variant || 'default'} focus ring`;
    }
  } else if (category === 'surface') {
    if (rest.includes('elevated')) {
      if (rest.includes('secondary')) desc = 'Elevated secondary surface (nested modals)';
      else desc = 'Elevated surface (modals, dropdowns)';
    } else if (rest.includes('secondary')) desc = 'Secondary surface (cards, sidebars)';
    else if (rest.includes('tertiary')) desc = 'Tertiary surface (nested containers)';
    else desc = 'Page background, main container';
  } else {
    desc = rest.join(' ') || 'Color token';
  }
  
  return desc;
}

function createSemanticToken(scopes, primitiveRef, tokenName) {
  const description = generateDescription(tokenName);
  return {
    "$scopes": scopes,
    "$description": `--${tokenName}\n${description}`,
    "$type": "color",
    "$libraryName": "",
    "$collectionName": "color primitive",
    "$value": `{${primitiveRef}}`
  };
}

// Sort order for colors
// Sort order: base tokens first, then semantic colors
const BASE_ORDER = ['default', 'primary', 'secondary', 'tertiary', 'disabled', 'inverse'];
const SEMANTIC_ORDER = ['info', 'warning', 'caution', 'danger', 'success', 'discovery'];
const VARIANT_ORDER = ['soft', 'surface', 'solid', 'outline', 'ghost'];
const STATE_ORDER = ['hover', 'active', 'alt', 'alpha', 'elevated'];

// Sort object keys recursively with custom order
function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null || obj.$type) {
    return obj; // Don't sort token objects (they have $type)
  }
  
  const keys = Object.keys(obj).filter(k => !k.startsWith('$'));
  const metaKeys = Object.keys(obj).filter(k => k.startsWith('$'));
  
  // Get sort index from multiple order arrays
  function getSortIndex(key) {
    // Base tokens first (0-99)
    const baseIdx = BASE_ORDER.indexOf(key);
    if (baseIdx !== -1) return baseIdx;
    
    // Semantic colors next (100-199)
    const semanticIdx = SEMANTIC_ORDER.indexOf(key);
    if (semanticIdx !== -1) return 100 + semanticIdx;
    
    // Variants (200-299)
    const variantIdx = VARIANT_ORDER.indexOf(key);
    if (variantIdx !== -1) return 200 + variantIdx;
    
    // States (300-399)
    const stateIdx = STATE_ORDER.indexOf(key);
    if (stateIdx !== -1) return 300 + stateIdx;
    
    // Everything else at the end (1000+)
    return 1000;
  }
  
  // Sort keys by priority
  keys.sort((a, b) => {
    const aIdx = getSortIndex(a);
    const bIdx = getSortIndex(b);
    if (aIdx !== bIdx) return aIdx - bIdx;
    // Alphabetical fallback for same category
    return a.localeCompare(b);
  });
  
  const sorted = {};
  // Add meta keys first
  metaKeys.forEach(k => sorted[k] = obj[k]);
  // Add sorted keys
  keys.forEach(k => sorted[k] = sortObjectKeys(obj[k]));
  
  return sorted;
}

// Build semantic tokens for a mode
function buildSemanticMode(tokens, mode) {
  const result = {};
  
  tokens.forEach(token => {
    let resolved = resolveAlias(token[mode], mode);
    
    // For Dark mode:
    // 1. Mirror gray ONLY if original light === dark values
    // 2. ALWAYS convert alpha to alpha-white (black alpha invisible on dark bg)
    if (mode === 'dark') {
      if (token.light === token.dark) {
        resolved = mirrorGrayForDark(resolved);
      }
      resolved = alphaToWhiteForDark(resolved);
    }
    
    const scopes = getScope(token.name);
    const path = getPath(token.name);
    
    // Navigate/create nested structure
    let current = result;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    // Set token at final path (no more token+container conflicts)
    current[path[path.length - 1]] = createSemanticToken(scopes, resolved, token.name);
  });
  
  return result;
}

// Build Color collection (two modes: Light, Dark)
const colorCollection = {
  "color": {
    "modes": {
      "Light": sortObjectKeys(buildSemanticMode(allTokens, 'light')),
      "Dark": sortObjectKeys(buildSemanticMode(allTokens, 'dark'))
    }
  }
};

// ============================================
// OUTPUT
// ============================================

const output = [colorCollection, colorPrimitive];

// Custom JSON stringify that preserves numeric key order
// V8 reorders integer keys, so we need to manually build JSON for affected objects
function stringifyWithOrder(obj) {
  const ALPHA_ORDER = ['00', '02', '04', '05', '06', '08', '10', '12', '15', '16', '20', '25', '30', '35', '40', '50'];
  const GRAY_ORDER = Object.keys(grayScale).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  
  function stringify(val, indent = 0) {
    const pad = '  '.repeat(indent);
    const padInner = '  '.repeat(indent + 1);
    
    if (val === null) return 'null';
    if (typeof val === 'string') return JSON.stringify(val);
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';
      const items = val.map(v => padInner + stringify(v, indent + 1));
      return '[\n' + items.join(',\n') + '\n' + pad + ']';
    }
    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 0) return '{}';
      
      // Determine sort order based on keys
      let sortedKeys = keys;
      const hasAlphaKeys = keys.some(k => ALPHA_ORDER.includes(k));
      const hasGrayKeys = keys.some(k => GRAY_ORDER.includes(k));
      
      if (hasAlphaKeys && keys.length === ALPHA_ORDER.length) {
        sortedKeys = ALPHA_ORDER.filter(k => keys.includes(k));
      } else if (hasGrayKeys && keys.length === GRAY_ORDER.length) {
        sortedKeys = GRAY_ORDER.filter(k => keys.includes(k));
      }
      
      const items = sortedKeys.map(k => 
        padInner + JSON.stringify(k) + ': ' + stringify(val[k], indent + 1)
      );
      return '{\n' + items.join(',\n') + '\n' + pad + '}';
    }
    return 'null';
  }
  
  return stringify(obj);
}

fs.writeFileSync('./reference/openai-design-system.json', stringifyWithOrder(output));

// Count tokens by category
const counts = {
  text: allTokens.filter(t => t.name.includes('-text') || t.name === 'color-text').length,
  background: allTokens.filter(t => t.name.includes('-background-')).length,
  border: allTokens.filter(t => t.name.includes('-border') || t.name === 'color-border').length,
  ring: allTokens.filter(t => t.name.includes('-ring') || t.name === 'color-ring').length,
  surface: allTokens.filter(t => t.name.includes('-surface')).length
};

console.log('Generated openai-design-system.json');
console.log('Total tokens:', allTokens.length);
console.log('Categories:', counts);
