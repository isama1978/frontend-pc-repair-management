import React, { useMemo } from 'react';
import { Provider, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from './app/store';
import { router } from './app/routes';
import type { RootState } from './app/store';

// Creamos un sub-componente interno para poder usar hooks de Redux
const AppContent: React.FC = () => {
  // Escuchamos activamente el modo ('light' o 'dark') del Store
  const mode = useSelector((state: RootState) => state.ui.mode);

  // Memorizamos la creación del tema para optimizar el rendimiento de renderizado
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode, // <- Aplica 'light' o 'dark' y MUI cambia automáticamente todos los colores base
          primary: {
            main: mode === 'light' ? '#1976d2' : '#90caf9', // Colores adaptativos si lo deseas
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Cambia el fondo del body y fuentes según el modo */}
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;