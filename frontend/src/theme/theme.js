import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary:   { main: "#4f46e5", light: "#818cf8", dark: "#3730a3", contrastText: "#fff" },
    secondary: { main: "#7c3aed", light: "#a78bfa", dark: "#5b21b6", contrastText: "#fff" },
    success:   { main: "#059669", light: "#34d399", dark: "#047857" },
    warning:   { main: "#d97706", light: "#fbbf24", dark: "#b45309" },
    error:     { main: "#dc2626", light: "#f87171", dark: "#b91c1c" },
    info:      { main: "#0284c7", light: "#38bdf8", dark: "#0369a1" },
    background:{ default: "#f8faff", paper: "#ffffff" },
    text:      { primary: "#1e1b4b", secondary: "#6b7280" },
    grey: {
      50:  "#f8faff", 100: "#f0f0ff", 200: "#e0e0ff",
      300: "#c7c7f0", 400: "#9494d0", 500: "#6b6ba8",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    h4: { fontWeight: 800 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 }, subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0.3 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    "0 1px 4px rgba(79,70,229,0.08)",
    "0 2px 8px rgba(79,70,229,0.10)",
    "0 4px 16px rgba(79,70,229,0.12)",
    "0 6px 24px rgba(79,70,229,0.14)",
    "0 8px 32px rgba(79,70,229,0.16)",
    ...Array(19).fill("none"),
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(79,70,229,0.10)",
          border: "1px solid rgba(79,70,229,0.08)",
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: "8px 20px" },
        containedPrimary: {
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
          "&:hover": { background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)", boxShadow: "0 6px 20px rgba(79,70,229,0.45)" },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: "0.72rem" } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4f46e5" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4f46e5", borderWidth: 2 },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
          borderRight: "none",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#f0f0ff",
            color: "#3730a3",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#f8faff" },
          "&:last-child td": { borderBottom: 0 },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, height: 8 },
      },
    },
  },
});

export default theme;
