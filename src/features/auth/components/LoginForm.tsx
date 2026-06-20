import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import type { AppDispatch, RootState } from "../../../app/store";
import { loginUser } from "../slice/authSlice";
import type { LoginRequest } from "../types";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uiDictionaries } from '../../../config/i18nDictionaries';

// Esquema de validación estricta en el cliente
const loginSchema = zod.object({
  email: zod.string().email("Por favor, ingresa un correo electrónico válido"),
  password: zod
    .string()
    .min(3, "La contraseña debe tener al menos 3 caracteres"), // 123 es el ejemplo de doc
});

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // 1. Obtenemos el idioma activo ('es', 'en', 'pt')
  const currentLang = useSelector((state: RootState) => state.ui.language);
  
  // 2. Apuntamos al set de textos correspondiente
  const t = uiDictionaries[currentLang].login;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginRequest) => {
    dispatch(loginUser(data));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/orders", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Paper
      elevation={4}
      sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8, borderRadius: 2 }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography
          component="h1"
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          {t.title}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 3 }}
        >
          {t.subtitle}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label={t.email}
          autoComplete="email"
          autoFocus
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label={t.password}
          type="password"
          id="password"
          autoComplete="current-password"
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={status === "loading"}
          sx={{ mt: 3, mb: 2, height: 46 }}
        >
          {status === "loading" ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t.submit
          )}
        </Button>
      </Box>
    </Paper>
  );
};
