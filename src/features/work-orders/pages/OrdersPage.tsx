import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store'; // Ajusta la ruta a tu store global
import { fetchAllOrders, fetchMyOrders } from '../slice/workOrdersSlice';
import type { WorkOrderStatus, WorkOrder } from '../types';
import {uiDictionaries} from '../../../config/i18nDictionaries'; // Diccionarios del Hito 1

import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';

// Colores semánticos para los estados de la orden
const statusStyles: Record<WorkOrderStatus, { labelKey: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'error' }> = {
  RECEIVED: { labelKey: 'statusReceived', color: 'default' },
  IN_PROGRESS: { labelKey: 'statusInProgress', color: 'primary' },
  READY: { labelKey: 'statusReady', color: 'success' },
  DELIVERED: { labelKey: 'statusDelivered', color: 'secondary' },
  CANCELLED: { labelKey: 'statusCancelled', color: 'error' },
};

export const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Consumo de estados globales (UI e i18n del Hito 1 + Work Orders)
  const lang = useSelector((state: RootState) => state.ui.language as 'es' | 'en' | 'pt');
  const t = uiDictionaries[lang].orders || uiDictionaries['es'].orders;
  
  const { orders, loading, error } = useSelector((state: RootState) => state.workOrders);

  // Obtenemos los datos del técnico logueado desde el slice de autenticación
  const { userRole } = useSelector((state: RootState) => state.auth);

  // 2. Control de Estado Inicial reactivo al rol (Si es TECH, se fuerza 'mine')
  const [viewMode, setViewMode] = useState<'all' | 'mine'>(userRole === 'ADMIN' ? 'all' : 'mine');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchDni, setSearchDni] = useState<string>('');
  const [searchSerial, setSearchSerial] = useState<string>('');

  // Carga inicial reactiva al modo de vista seleccionado
  useEffect(() => {
    if (viewMode === 'all' && userRole === 'ADMIN') {
      dispatch(fetchAllOrders());
    } else {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, viewMode, userRole]);

  // Filtrado combinatorio en el cliente para máxima respuesta de UX
  const filteredOrders = useMemo(() => {
    return orders.filter((order: WorkOrder) => {
      const matchStatus = filterStatus === 'ALL' || order.status === filterStatus;
      // Nota: Si tu backend no expone directamente el DNI plano en la orden, 
      // esto asume que viene mapeado o se puede buscar por coincidencia exacta de ID/string.
      const matchDni = searchDni === '' || order.clientId.toLowerCase().includes(searchDni.toLowerCase());
      const matchSerial = searchSerial === '' || (order.serialNumber && order.serialNumber.toLowerCase().includes(searchSerial.toLowerCase()));
      
      return matchStatus && matchDni && matchSerial;
    });
  }, [orders, filterStatus, searchDni, searchSerial]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        {/* Encabezado y Selector de Ámbito (US-03) */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
          <Typography sx={{ variant: 'h4', fontWeight: 'bold' }} component="h1">
            {viewMode === 'all' ? t.allOrdersTitle || 'Órdenes de Trabajo' : t.myOrdersTitle || 'Mis Órdenes Asignadas'}
          </Typography>
          
          <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <Button 
              variant={viewMode === 'all' ? 'contained' : 'outlined'} 
              onClick={() => setViewMode('all')}
              disabled={userRole !== 'ADMIN'}
            >
              {t.viewAllBtn || 'Ver Todas'}
            </Button>
            <Button 
              variant={viewMode === 'mine' ? 'contained' : 'outlined'} 
              onClick={() => setViewMode('mine')}
            >
              {t.viewMineBtn || 'Mis Órdenes'}
            </Button>
          </ButtonGroup>
        </Box>

        {/* Panel de Filtros Interactivos (US-03) */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label={t.filterStatusLabel || 'Filtrar por Estado'}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="ALL">{t.statusAll || 'Todos los estados'}</MenuItem>
                <MenuItem value="RECIBIDO">{t.received || 'Recibido'}</MenuItem>
                <MenuItem value="DIAGNOSTICANDO">{t.diagnostic || 'Diagnosticando'}</MenuItem>
                <MenuItem value="PRESUPUESTADO">{t.budgeting || 'Presupuestado'}</MenuItem>
                <MenuItem value="ESPERANDO_REPUESTO">{t.waitingForPart || 'Esperando Repuesto'}</MenuItem>
                <MenuItem value="REPARANDO">{t.repair || 'Reparando'}</MenuItem>
                <MenuItem value="TESTEANDO">{t.test || 'Testeando'}</MenuItem>
                <MenuItem value="LISTO">{t.ready || 'Listo'}</MenuItem>
                <MenuItem value="ENTREGADO">{t.delivered || 'Entregado'}</MenuItem>
                <MenuItem value="CANCELADO">{t.cancelled || 'Cancelado'}</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label={t.searchDniLabel || 'Buscar por Cliente (ID/DNI)'}
                variant="outlined"
                value={searchDni}
                onChange={(e) => setSearchDni(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label={t.searchSerialLabel || 'Número de Serie'}
                variant="outlined"
                value={searchSerial}
                onChange={(e) => setSearchSerial(e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Control de Errores del Servidor */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabla Avanzada de Datos (MUI Table) */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }} aria-label="work orders table">
              <TableHead sx={{ backgroundColor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t.thId || 'ID Orden'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t.thEquipment || 'Equipo'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t.thFailure || 'Falla Reportada'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t.thStatus || 'Estado'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">{t.thTotal || 'Monto Total'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">{t.thActions || 'Acciones'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      {t.noOrdersFound || 'No se encontraron órdenes que coincidan con los criterios.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusConfig = statusStyles[order.status];
                    return (
                      <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace' }}>
                          {order.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {`${order.equipmentType} - ${order.brand} ${order.model}`}
                          {order.serialNumber && (
                                    <Typography sx={{ variant: 'caption', display: 'block', color: 'textSecondary' }}>
                              S/N: {order.serialNumber}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.reportedFailure}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={t[order.status] || order.status} 
                            color={statusConfig?.color || 'default'} 
                            size="small" 
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: '600' }}>
                          ${order.totalAmount}
                        </TableCell>
                        <TableCell align="center">
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              // Aquí despacharemos la selección antes de navegar al detalle
                              // dispatch(setCurrentOrder(order));
                              // navigate(`/orders/${order.id}`);
                            }}
                          >
                            {t.viewDetailsBtn || 'Ver Detalle'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};