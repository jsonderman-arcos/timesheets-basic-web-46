// src/theme/createMuiTheme.ts
import { extendTheme } from "@mui/material/styles";
import core from "@/styles/core.muiflat.json";
import themeTokens from "@/styles/theme.muiflat.json";

// Direct lookup into token map, with optional fallback
const get = (k: string, fallback?: any) => (themeTokens as any)[k] ?? fallback;

const px = (v: string | number | undefined, fallback: number): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
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
  main: typeof main === "string" ? main : fallbackMain,
  ...(typeof contrastText === "string" ? { contrastText } : { contrastText: fallbackContrast }),
});

export function createMuiThemeFromTokens() {
  // Pull token values (provide safe fallbacks so `augmentColor` never crashes)
  const primary = asColor(
    get("theme-base-primary-main") as string | undefined,
    get("theme-base-primary-contrast-text") as string | undefined,
    "#1976d2",
    "#fff"
  );

  const secondary = asColor(
    get("theme-base-secondary-main") as string | undefined,
    get("theme-base-secondary-contrast-text") as string | undefined,
    "#9c27b0",
    "#fff"
  );

  const error = asColor(
    get("theme-base-feedback-error-main") as string | undefined,
    get("theme-base-feedback-error-contrast-text") as string | undefined,
    "#d32f2f",
    "#fff"
  );

  const backgroundDefault = (get("theme-base-background-default") as string | undefined) ?? "#fff";
  const backgroundPaper = (get("theme-base-background-surface") as string | undefined) ?? "#fff";
  const textPrimary = (get("theme-base-text-primary") as string | undefined) ?? "#111";
  const textSecondary = (get("theme-base-text-secondary") as string | undefined) ?? "#555";
  const divider = (get("theme-base-border-default") as string | undefined) ?? "#e0e0e0";

  const radius = px(get("theme-base-shape-border-radius") as any, 8);
  const spaceUnit = px(get("theme-base-spacing-unit") as any, 8);

  const bpSm = px((core as any)["core-breakpoints-breakpoint-sm"], 600);
  const bpMd = px((core as any)["core-breakpoints-breakpoint-md"], 900);
  const bpLg = px((core as any)["core-breakpoints-breakpoint-lg"], 1200);
  const bpXl = px((core as any)["core-breakpoints-breakpoint-xl"], 1536);

  const fontFamily = (get("theme-base-typography-font-family") as string | undefined) ??
    "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
  const fontSizeRoot = px(get("theme-base-typography-font-size-root") as any, 14);

  return extendTheme({
    // Using `colorSchemes` implies the CSS Vars theme API. This structure is OK for MUI v5+ with `extendTheme`.
    colorSchemes: {
      light: {
        palette: {
          primary,
          secondary,
          error,
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
      fontFamily,
      fontSize: fontSizeRoot,
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'contained',
          color: 'primary',
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          contained: {
            backgroundColor: 'var(--theme-component-button-primary-background-default)',
            color: 'var(--theme-component-button-primary-text-default)',
            '&:hover': {
              backgroundColor: 'var(--theme-component-button-primary-background-hover)',
            },
            '&:active': {
              backgroundColor: 'var(--theme-component-button-primary-background-hover)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'var(--theme-component-button-primary-background-disabled)',
              color: 'var(--theme-component-button-primary-text-disabled)',
            },
          },
          outlined: {
            color: 'var(--theme-component-button-primary-background-default)',
            borderColor: 'var(--theme-component-button-primary-background-default)',
            '&:hover': {
              borderColor: 'var(--theme-component-button-primary-background-hover)',
              backgroundColor: 'var(--theme-component-button-primary-background-hover)',
              color: 'var(--theme-component-button-primary-background-default)',
            },
            '&.Mui-disabled': {
              borderColor: 'var(--theme-component-button-primary-background-disabled)',
              color: 'var(--theme-component-button-primary-background-disabled)',
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--theme-base-background-elevations-level-3)',
          },
        },
      },
    },
  });
}

export default createMuiThemeFromTokens;
