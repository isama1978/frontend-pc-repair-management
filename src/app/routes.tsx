import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginForm } from "../features/auth/components/LoginForm";
import { ProtectedRoute } from "../components/Layouts/ProtectedRoute";
import { DashboardLayout } from "../components/Layouts/DashboardLayout";
import { OrdersPage } from "../features/work-orders/pages/OrdersPage";
import { OrderDetailsPage } from "../features/work-orders/pages/OrderDetailsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    element: <ProtectedRoute />, // Protección del ecosistema privado
    children: [
      {
        element: <DashboardLayout />, // Marco visual administrativo
        children: [
          {
            path: "/orders",
            element: <OrdersPage />, // <- Cero strings hardcodeados aquí
          },
          // Redirección por defecto si entran a la raíz privada "/"
          {
            path: "/",
            element: <Navigate to="/orders" replace />,
          },
          {
            // PASO 4: Ruta paramétrica dedicada para la hidratación atómica de la orden
            path: "orders/:id",
            element: <OrderDetailsPage />,
          },
        ],
      },
    ],
  },
  // Captura cualquier ruta inexistente y la manda al login o inicio
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
