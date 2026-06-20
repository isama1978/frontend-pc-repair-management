import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SupportedLanguages = 'es' | 'en' | 'pt';
export type ThemeMode = 'light' | 'dark';

interface UIState {
  language: SupportedLanguages;
  mode: ThemeMode;
}

// Idioma por defecto del navegador o 'es' si no está soportado
const getInitialLanguage = (): SupportedLanguages => {
  const localLang = localStorage.getItem('lang') as SupportedLanguages;
  if (['es', 'en', 'pt'].includes(localLang)) return localLang;
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguages;
  return ['es', 'en', 'pt'].includes(browserLang) ? browserLang : 'es';
};

const getInitialThemeMode = (): ThemeMode => {
  const localMode = localStorage.getItem('themeMode') as ThemeMode;
  return localMode === 'dark' ? 'dark' : 'light';
};

const initialState: UIState = {
  language: getInitialLanguage(),
  mode: getInitialThemeMode(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguages>) => {
      state.language = action.payload;
      localStorage.setItem('lang', action.payload);
    },
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', state.mode);
    },
  },
});

export const { setLanguage, toggleThemeMode } = uiSlice.actions;
export default uiSlice.reducer;