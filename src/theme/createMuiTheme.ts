// src/theme/createMuiTheme.ts - Simplified ARCOS Harmony integration
import { extendTheme } from "@mui/material/styles";

export function createMuiThemeFromTokens() {
  // Use standard MUI color values with ARCOS-inspired colors
  const primary = {
    main: "#1976d2", // Blue
    contrastText: "#ffffff"
  };

  const secondary = {
    main: "#dc004e", // ARCOS brand red
    contrastText: "#ffffff"
  };

  const error = {
    main: "#d32f2f",
    contrastText: "#ffffff"
  };

  const success = {
    main: "#2e7d32",
    contrastText: "#ffffff"
  };

  const warning = {
    main: "#ed6c02",
    contrastText: "#ffffff"
  };

  // Standard MUI background and text values
  const backgroundDefault = "#ffffff";
  const backgroundPaper = "#f5f5f5";
  const textPrimary = "#000000";
  const textSecondary = "#666666";
  const divider = "#e0e0e0";

  // ARCOS design system values
  const radius = 8;
  const spaceUnit = 2; // 16px base / 8

  // ARCOS breakpoints
  const bpSm = 640;
  const bpMd = 768;
  const bpLg = 1024;
  const bpXl = 1280;

  // ARCOS typography
  const fontFamily = "Arial";
  const fontSizeRoot = 16;

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
            default: "#121212",
            paper: "#1e1e1e",
          },
          text: {
            primary: "#ffffff",
            secondary: "#b3b3b3",
          },
          divider: "#333333",
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
      fontFamily: `"${fontFamily}", "Roboto", "Helvetica", sans-serif`,
      fontSize: fontSizeRoot,
    },
  });
}

export default createMuiThemeFromTokens;