import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { workOrdersService } from "../api/workOrdersService";
import type {
  WorkOrdersState,
  WorkOrder,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  BackendWorkOrderWrapper, // El contenedor estructural { props: WorkOrder }
  OrderHistory,
  OrderPart,
  AddPartToOrderResponse,
  AddPartToOrderRequest,
} from "../types";

const initialState: WorkOrdersState = {
  orders: [],
  currentOrder: null,
  history: [],
  parts: [],
  loading: false,
  error: null,
};

// 1. Tipamos explícitamente el retorno del Thunk como BackendWorkOrderWrapper[] o BackendWorkOrderWrapper
export const fetchAllOrders = createAsyncThunk<BackendWorkOrderWrapper[], void>(
  "workOrders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      // Si tu servicio Axios ya devuelve el formato crudo del backend, lo tipamos aquí
      const response = await workOrdersService.getAllOrders();
      return response as unknown as BackendWorkOrderWrapper[];
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Error al obtener el listado de órdenes.");
    }
  },
);

export const fetchMyOrders = createAsyncThunk<BackendWorkOrderWrapper[], void>(
  "workOrders/fetchMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await workOrdersService.getMyOrders();
      return response as unknown as BackendWorkOrderWrapper[];
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Error al obtener tus órdenes.");
    }
  },
);

export const createNewOrder = createAsyncThunk<
  BackendWorkOrderWrapper,
  CreateOrderRequest
>("workOrders/createNewOrder", async (data, { rejectWithValue }) => {
  try {
    const response = await workOrdersService.createOrder(data);
    return response as unknown as BackendWorkOrderWrapper;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Error al crear la orden de trabajo.");
  }
});

export const updateOrderStatus = createAsyncThunk<
  BackendWorkOrderWrapper,
  { id: string; data: UpdateOrderStatusRequest }
>("workOrders/updateOrderStatus", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await workOrdersService.updateStatus(id, data);
    return response as unknown as BackendWorkOrderWrapper;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Error al actualizar el estado de la orden.");
  }
});

export const cancelOrder = createAsyncThunk<
  BackendWorkOrderWrapper,
  { id: string; data: CancelOrderRequest }
>("workOrders/cancelOrder", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await workOrdersService.cancelOrder(id, data);
    return response as unknown as BackendWorkOrderWrapper;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return rejectWithValue(error.response.data.message);
    }
    return rejectWithValue("Error al cancelar la orden.");
  }
});

// Definimos primero la interfaz del retorno exitoso para mantener limpio el Thunk
export interface FetchOrderDetailsResponse {
  history: OrderHistory[];
  parts: OrderPart[];
}

export const fetchOrderDetailsData = createAsyncThunk<
  FetchOrderDetailsResponse, // Tipo del payload retornado en caso de éxito (fulfilled)
  string // Tipo del argumento de entrada (el ID de la orden)
>(
  "workOrders/fetchOrderDetailsData",
  async (id: string, { rejectWithValue }) => {
    try {
      const [history, parts] = await Promise.all([
        workOrdersService.getOrderHistory(id),
        workOrdersService.getOrderParts(id),
      ]);

      // Si el backend envuelve el historial o los repuestos en un objeto ".props" cada uno,
      // aquí deberías desenvolverlos con un .map((h: any) => h.props) reemplazando el any por el wrapper correspondiente.
      // Si vienen como arrays planos directos de entidades secundarias, se retorna de esta forma:
      return { history, parts };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(
        "Error al cargar la información detallada de la orden.",
      );
    }
  },
);

export const addPartToOrder = createAsyncThunk<
  AddPartToOrderResponse & { partId: string; quantity: number }, 
  { orderId: string; data: AddPartToOrderRequest },
  { rejectValue: string }
>('workOrders/addPart', async ({ orderId, data }, { rejectWithValue }) => {
  try {
    const response = await workOrdersService.addPartToOrder(orderId, data);
    return {
      ...response,
      partId: data.partId,
      quantity: data.quantity
    };
  } catch (error: unknown) {
    return rejectWithValue('Error al agregar el repuesto al pañol');
  }
});

const workOrdersSlice = createSlice({
  name: "workOrders",
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<WorkOrder | null>) => {
      state.currentOrder = action.payload;
    },
    clearWorkOrdersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllOrders.fulfilled,
        (state, action: PayloadAction<BackendWorkOrderWrapper[]>) => {
          state.loading = false;
          // Ahora sí machea: action.payload es BackendWorkOrderWrapper[]
          // Recorremos el contrato y guardamos únicamente WorkOrder[] en el estado
          state.orders = action.payload.map((item) => item.props);
        },
      )
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyOrders.fulfilled,
        (state, action: PayloadAction<BackendWorkOrderWrapper[]>) => {
          state.loading = false;
          state.orders = action.payload.map((item) => item.props);
        },
      )
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Order
      .addCase(
        createNewOrder.fulfilled,
        (state, action: PayloadAction<BackendWorkOrderWrapper>) => {
          state.orders.unshift(action.payload.props);
        },
      )

      // Update Status
      .addCase(
        updateOrderStatus.fulfilled,
        (state, action: PayloadAction<BackendWorkOrderWrapper>) => {
          const updatedOrder = action.payload.props;
          const index = state.orders.findIndex((o) => o.id === updatedOrder.id);
          if (index !== -1) state.orders[index] = updatedOrder;
          if (state.currentOrder?.id === updatedOrder.id)
            state.currentOrder = updatedOrder;
        },
      )

      // Cancel Order
      .addCase(
        cancelOrder.fulfilled,
        (state, action: PayloadAction<BackendWorkOrderWrapper>) => {
          const cancelledOrder = action.payload.props;
          const index = state.orders.findIndex(
            (o) => o.id === cancelledOrder.id,
          );
          if (index !== -1) state.orders[index] = cancelledOrder;
          if (state.currentOrder?.id === cancelledOrder.id)
            state.currentOrder = cancelledOrder;
        },
      )

      .addCase(fetchOrderDetailsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrderDetailsData.fulfilled,
        (state, action: PayloadAction<FetchOrderDetailsResponse>) => {
          state.loading = false;
          state.history = action.payload.history;
          state.parts = action.payload.parts;
        },
      )
      .addCase(fetchOrderDetailsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentOrder, clearWorkOrdersError } =
  workOrdersSlice.actions;
export default workOrdersSlice.reducer;
