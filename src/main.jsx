import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LicenseInfo } from '@mui/x-license';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// Set your MUI X Pro license key here
LicenseInfo.setLicenseKey('8400c94662a400aa7f13e5a5cb808d7aTz0xMTYzMTQsRT0xNzg0NDE5MTk5MDAwLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1RMy0yMDI0LEtWPTI='); // Replace with your actual key

// Enhanced MUI theme with refined color scheme, typography, and component overrides
const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' }, // Deeper blue for accents
    secondary: { main: '#43a047' }, // Subtle green for highlights
    background: { default: '#f5f5f5', paper: '#ffffff' }, // Neutral backgrounds
    text: { primary: '#333333', secondary: '#666666' }, // Higher contrast text
  },
  typography: {
    fontFamily: 'Inter, sans-serif', // Modern sans-serif for headings/body
    h5: { fontWeight: 600 }, // Bolder headings
    h6: { fontWeight: 500 },
    body1: { fontFamily: 'Open Sans, sans-serif' }, // Clean body font
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }, // Subtle shadow
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', transition: 'background-color 0.3s ease' }, // Smooth hover
      },
    },
    MuiTreeItem: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: '#e8f4fd' } }, // Hover effect
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: { border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }, // Subtle elevation
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { boxShadow: '0 4px 8px rgba(0,0,0,0.15)', transition: 'opacity 0.3s ease' }, // Animation
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizes styles */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);