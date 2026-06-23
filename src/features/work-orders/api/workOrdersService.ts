import { apiClient } from '../../../services/apiClient';
import type {
  WorkOrder,
  OrderHistory,
  OrderPart,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  AddPartToOrderRequest,
  AddPartToOrderResponse,
} from '../types';

export const workOrdersService = {
  // GET /orders - Listar todas las órdenes
  getAllOrders: async (): Promise<WorkOrder[]> => {
    const response = await apiClient.get<WorkOrder[]>('/orders');
    return response.data;
  },

  // GET /orders/my-orders - Órdenes del técnico logueado
  getMyOrders: async (): Promise<WorkOrder[]> => {
    const response = await apiClient.get<WorkOrder[]>('/orders/my-orders');
    return response.data;
  },

  // POST /orders - Creación de nueva orden
  createOrder: async (data: CreateOrderRequest): Promise<WorkOrder> => {
    const response = await apiClient.post<WorkOrder>('/orders', data);
    return response.data;
  },

  // PATCH /orders/:id/status - Cambiar estado
  updateStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<WorkOrder> => {
    const response = await apiClient.patch<WorkOrder>(`/orders/${id}/status`, data);
    return response.data;
  },

  // PATCH /orders/:id/cancel - Cancelación de orden
  cancelOrder: async (id: string, data: CancelOrderRequest): Promise<WorkOrder> => {
    const response = await apiClient.patch<WorkOrder>(`/orders/${id}/cancel`, data);
    return response.data;
  },

  // GET /orders/:id/history - Historial de la orden
  getOrderHistory: async (id: string): Promise<OrderHistory[]> => {
    const response = await apiClient.get<OrderHistory[]>(`/orders/${id}/history`);
    return response.data;
  },

  // GET /orders/:id/parts - Repuestos consumidos por la orden
  getOrderParts: async (id: string): Promise<OrderPart[]> => {
    const response = await apiClient.get<OrderPart[]>(`/orders/${id}/parts`);
    return response.data;
  },

  // POST /orders/:orderId/parts - Adición de repuesto
  addPartToOrder: async (orderId: string, data: AddPartToOrderRequest): Promise<AddPartToOrderResponse> => {
    const response = await apiClient.post<AddPartToOrderResponse>(`/orders/${orderId}/parts`, data);
    return response.data;
  },

  // DELETE /orders/:orderId/parts/:partId - Remoción de repuesto
  removePartFromOrder: async (orderId: string, partId: string): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}/parts/${partId}`);
  },

  // GET /orders/:dni/dni - Órdenes por DNI de cliente
  getOrdersByDni: async (dni: string): Promise<WorkOrder[]> => {
    const response = await apiClient.get<WorkOrder[]>(`/orders/${dni}/dni`);
    return response.data;
  },

  // GET /orders/:serialNumber/serial-number - Órdenes por número de serie
  getOrderBySerialNumber: async (serialNumber: string): Promise<WorkOrder[]> => {
    const response = await apiClient.get<WorkOrder[]>(`/orders/${serialNumber}/serial-number`);
    return response.data;
  },

  // GET /orders/:status/orders - Órdenes por estado
  getOrdersByStatus: async (status: string): Promise<WorkOrder[]> => {
    const response = await apiClient.get<WorkOrder[]>(`/orders/${status}/orders`);
    return response.data;
  },
};