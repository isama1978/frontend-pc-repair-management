import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  CssBaseline,
  IconButton,
  Chip,
} from "@mui/material";
import { logout } from "../../features/auth/slice/authSlice";
import { LanguageSelector } from "./LanguageSelector";
import { uiDictionaries } from "../../config/i18nDictionaries";
import { toggleThemeMode } from "../../features/ui/uiSlice";
import type { RootState } from "../../app/store";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const currentMode = useSelector((state: RootState) => state.ui.mode);

  // 1. Obtenemos el idioma activo ('es', 'en', 'pt')
  const currentLang = useSelector((state: RootState) => state.ui.language);

  const isAtOrders = location.pathname === "/orders";

  // 2. Apuntamos al set de textos correspondiente
  const t = uiDictionaries[currentLang].dashboard;

  // Consumo seguro del estado de Autenticación
  const { userFullName, userRole } = useSelector(
    (state: RootState) => state.auth,
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t.title}
          </Typography>
          <Button
            color="inherit"
            disabled={isAtOrders} // <- Opción A: Se deshabilita si ya está ahí (evita clicks redundantes)
            sx={{
              ml: 2,
              // Opción B: Si está ahí, le damos un estilo visual de "activo" (ej. un fondo sutil o borde)
              backgroundColor: isAtOrders
                ? "rgba(255, 255, 255, 0.15)"
                : "transparent",
              borderBottom: isAtOrders ? "2px solid white" : "none",
              borderRadius: isAtOrders ? "4px 4px 0 0" : "4px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              },
            }}
            onClick={() => navigate("/orders")}
          >
            {t.orders}
          </Button>

          {userFullName && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 3 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, opacity: 0.9 }}
              >
                {`${t.welcomeGreeting}${userFullName}`}
              </Typography>
              {userRole && (
                <Chip
                  label={userRole}
                  size="small"
                  color={userRole === "ADMIN" ? "secondary" : "default"}
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.65rem",
                    height: 20,
                    bgcolor:
                      userRole === "ADMIN"
                        ? "secondary.main"
                        : "rgba(255,255,255,0.2)",
                    color: "#fff",
                  }}
                />
              )}
            </Box>
          )}

          {/* Selector de idiomas agregado */}
          <Box sx={{ ml: 2 }}>
            <LanguageSelector />
          </Box>
          <IconButton
            sx={{ ml: 1 }}
            onClick={() => dispatch(toggleThemeMode())}
            color="inherit"
          >
            {currentMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ ml: 2, bgcolor: "rgba(255,255,255,0.1)" }}
          >
            {t.logout}
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Aquí es donde react-router inyectará las páginas privadas */}
        <Outlet />
      </Container>
    </Box>
  );
};
