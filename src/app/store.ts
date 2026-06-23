import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/ui/uiSlice';
import authReducer from '../features/auth/slice/authSlice';
import workOrdersReducer from '../features/work-orders/slice/workOrdersSlice';
// import inventoryReducer from '../features/inventory/inventorySlice';
// import clientsReducer from '../features/clients/clientsSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    workOrders: workOrdersReducer,
    // inventory: inventoryReducer,
    // clients: clientsReducer,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;