import React from 'react';
import { useSelector } from 'react-redux';
import { Typography, Paper } from '@mui/material';
import type { RootState } from '../../../app/store';
import { uiDictionaries } from '../../../config/i18nDictionaries';

export const OrdersPage: React.FC = () => {
  // Extraemos el idioma del estado global de la UI
  const currentLang = useSelector((state: RootState) => state.ui.language);
  const t = uiDictionaries[currentLang].orders;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t.title}
      </Typography>
      <Typography variant="body1">
        {t.comingSoon}
      </Typography>
    </Paper>
  );
};