import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Menu, MenuItem } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import type { RootState } from '../../app/store';
import { setLanguage } from '../../features/ui/uiSlice';
import type { SupportedLanguages } from '../../features/ui/uiSlice';

export const LanguageSelector: React.FC = () => {
  const dispatch = useDispatch();
  const currentLang = useSelector((state: RootState) => state.ui.language);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLang = (lang: SupportedLanguages) => {
    dispatch(setLanguage(lang));
    handleClose();
  };

  return (
    <>
      <Button
        color="inherit"
        startIcon={<TranslateIcon />}
        onClick={handleOpen}
        sx={{ textTransform: 'uppercase' }}
      >
        {currentLang}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleSelectLang('es')}>Español (ES)</MenuItem>
        <MenuItem onClick={() => handleSelectLang('en')}>English (EN)</MenuItem>
        <MenuItem onClick={() => handleSelectLang('pt')}>Português (PT)</MenuItem>
      </Menu>
    </>
  );
};