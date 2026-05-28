import { createTheme } from '@mui/material/styles';

// Augment the palette to include custom colors like 'purple'
declare module '@mui/material/styles' {
  interface Palette {
    purple: Palette['primary'];
  }
  interface PaletteOptions {
    purple?: PaletteOptions['primary'];
  }
}

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#426ef0', // Blue
    },
    secondary: {
      main: '#f9fafb', // Light gray - used for secondary elements
    },
    error: {
      main: '#DC2626',
      light: '#E53E3E',
    },
    warning: {
      main: '#D97706',
      light: '#FBBC04',
    },
    success: {
      main: '#059669',
      light: '#34A853',
    },
    purple: {
      main: '#7C3AED',
    },
    text: {
      primary: '#323843', // Dark gray for headings
      secondary: '#555d6d', // Medium gray for descriptions
      disabled: 'rgba(10, 10, 10, 0.5)', // Placeholder text
    },
    background: {
      default: '#f9fafb', // Light gray background
      paper: '#ffffff', // White for cards and surfaces
    },
    divider: '#DEE1E6', // Light gray for borders
  },
  components: {},
});

export default theme;