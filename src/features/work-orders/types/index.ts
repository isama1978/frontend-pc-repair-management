export type WorkOrderStatus = 'RECEIVED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderPart {
  id: string;
  partId: string;
  quantity: number;
  unitPrice: number;
  nameKey: string;
}

export interface OrderHistory {
  id: string;
  userId: string;
  changeDescription: string;
  timestamp: string;
  notes?: string;
}

export interface BackendWorkOrderWrapper {
  props: WorkOrder;
}

export interface WorkOrder {
  id: string;
  clientId: string;
  clientName: string; // Agregado
  equipmentType: string;
  brand: string;
  model: string;
  reportedFailure: string;
  status: WorkOrderStatus;
  totalAmount: number;
  laborCost: number; // Agregado
  createdAt: string;
  serialNumber: string | null;
  aestheticCondition: string | null; // Agregado
  deliveryDate: string | null; // Agregado
  technicalDiagnosis: string | null; // Agregado
  technicianId: string | null; // Agregado
}

// DTOs para peticiones de API
export interface CreateOrderRequest {
  clientId: string;
  equipmentType: string;
  brand: string;
  model: string;
  reportedFailure: string;
}

export interface UpdateOrderStatusRequest {
  status: WorkOrderStatus;
}

export interface CancelOrderRequest {
  notes: string;
}

export interface AddPartToOrderRequest {
  partId: string;
  quantity: number;
}

export interface AddPartToOrderResponse {
  message: string;
  newTotalAmount: number;
}

// Estado del Slice de Redux
export interface WorkOrdersState {
  orders: WorkOrder[];
  currentOrder: WorkOrder | null;
  history: OrderHistory[];
  parts: OrderPart[];
  loading: boolean;
  error: string | null;
}