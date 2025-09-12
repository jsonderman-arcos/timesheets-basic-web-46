// src/theme/createMuiTheme.ts - Updated to use ARCOS Harmony Design System
import { extendTheme } from "@mui/material/styles";

// Import the ARCOS Harmony design tokens
const themeTokens = require('../styles/theme.flat.json');
const coreTokens = require('../styles/core.flat.json');

// Helper functions to extract token values
const get = (k: string, fallback?: any) => {
  return themeTokens[k]?.valuesByMode?.Light ?? fallback;
};

const getCore = (k: string, fallback?: any) => {
  return coreTokens[k]?.valuesByMode?.Default ?? fallback;
};

const px = (v: string | number | undefined, fallback: number): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const match = v.match(/^(\d+(?:\.\d+)?)(?:px)?$/);
    if (match) return parseFloat(match[1]);
  }
  return fallback;
};

// Ensure we always hand MUI an object with `{ main: string }`
const asColor = (
  main: string | undefined,
  contrastText?: string | undefined,
  fallbackMain: string = "#1976d2",
  fallbackContrast: string = "#fff"
) => ({
  main: typeof main === "string" && main.startsWith('var(') ? main : fallbackMain,
  ...(typeof contrastText === "string" && contrastText.startsWith('var(') ? { contrastText } : { contrastText: fallbackContrast }),
});

export function createMuiThemeFromTokens() {
  // Pull ARCOS token values with safe fallbacks
  const primary = asColor(
    get("theme-base-primary-main") as string | undefined,
    get("theme-base-primary-contrast-text") as string | undefined,
    "var(--theme-base-primary-main)",
    "var(--theme-base-primary-contrast-text)"
  );

  const secondary = asColor(
    get("theme-base-secondary-main") as string | undefined,
    get("theme-base-secondary-contrast-text") as string | undefined,
    "var(--theme-base-secondary-main)",
    "var(--theme-base-secondary-contrast-text)"
  );

  const error = asColor(
    get("theme-base-feedback-error-main") as string | undefined,
    get("theme-base-feedback-error-contrast-text") as string | undefined,
    "var(--theme-base-feedback-error-main)",
    "var(--theme-base-feedback-error-contrast-text)"
  );

  const success = asColor(
    get("theme-base-feedback-success-main") as string | undefined,
    get("theme-base-feedback-success-contrast-text") as string | undefined,
    "var(--theme-base-feedback-success-main)",
    "var(--theme-base-feedback-success-contrast-text)"
  );

  const warning = asColor(
    get("theme-base-feedback-warning-main") as string | undefined,
    get("theme-base-feedback-warning-contrast-text") as string | undefined,
    "var(--theme-base-feedback-warning-main)",
    "var(--theme-base-feedback-warning-contrast-text)"
  );

  // Extract ARCOS background and text values
  const backgroundDefault = get("theme-base-background-default") ?? "var(--theme-base-background-default)";
  const backgroundPaper = get("theme-base-background-paper-elevation-1") ?? "var(--theme-base-background-paper-elevation-1)";
  const textPrimary = get("theme-base-text-primary") ?? "var(--theme-base-text-primary)";
  const textSecondary = get("theme-base-text-secondary") ?? "var(--theme-base-text-secondary)";
  const divider = get("theme-base-divider-default") ?? "var(--theme-base-divider-default)";

  // Extract spacing and shape values from ARCOS core tokens
  const radius = px(getCore("core-radii-border-radius") as any, 8);
  const spaceUnit = px(getCore("core-spacing-spacing-base") as any, 16) / 8; // MUI uses 8px base

  // Extract ARCOS breakpoints
  const bpSm = px(getCore("core-breakpoints-breakpoint-sm"), 640);
  const bpMd = px(getCore("core-breakpoints-breakpoint-md"), 768);
  const bpLg = px(getCore("core-breakpoints-breakpoint-lg"), 1024);
  const bpXl = px(getCore("core-breakpoints-breakpoint-xl"), 1280);

  // Extract ARCOS typography
  const fontFamily = getCore("core-lighthouse-typography-font-family-base") ??
    "var(--core-lighthouse-typography-font-family-base)";
  const fontSizeRoot = px(getCore("core-lighthouse-typography-font-size-root") as any, 16);

  return extendTheme({
    colorSchemes: {
      light: {
        palette: {
          primary,
          secondary,
          error,
          success,
          warning,
          background: {
            default: backgroundDefault,
            paper: backgroundPaper,
          },
          text: {
            primary: textPrimary,
            secondary: textSecondary,
          },
          divider,
        },
      },
      dark: {
        palette: {
          primary,
          secondary,
          error,
          success,
          warning,
          background: {
            default: backgroundDefault,
            paper: backgroundPaper,
          },
          text: {
            primary: textPrimary,
            secondary: textSecondary,
          },
          divider,
        },
      },
    },
    shape: {
      borderRadius: radius,
    },
    spacing: (n: number) => n * spaceUnit,
    breakpoints: {
      values: { xs: 0, sm: bpSm, md: bpMd, lg: bpLg, xl: bpXl },
    },
    typography: {
      fontFamily: `"${fontFamily}", "Arial", "Roboto", "Helvetica", sans-serif`,
      fontSize: fontSizeRoot,
    },
  });
}

export default createMuiThemeFromTokens;