import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Grid, Typography, Paper, Card, CardContent, Divider, 
  Button, TextField, Select, MenuItem, InputLabel, FormControl,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box
} from '@mui/material';
import { Delete as DeleteIcon, History as HistoryIcon, Build as BuildIcon } from '@mui/icons-material';

// Uso estricto de tus nuevos hooks tipados
import { useAppDispatch, useAppSelector } from '../../../app/hooks'; 
import { fetchOrderDetailsData, addPartToOrder, updateOrderStatus } from '../slice/workOrdersSlice';
import {uiDictionaries} from '../../../config/i18nDictionaries';
import type { OrderHistory, WorkOrderStatus } from '../types';

// Validación Zod para agregar repuesto
const partSchema = z.object({
  partId: z.string().uuid({ message: 'Debe ser un UUID válido' }),
  quantity: z.number().min(1, { message: 'Mínimo 1 unidad' }),
});

type PartFormValues = z.infer<typeof partSchema>;

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  
  // Extracción del estado global basado en WorkOrdersState de tu WorkOrderTypes.md
  const { currentOrder, history, parts, loading } = useAppSelector((state) => state.workOrders);
  const { userRole } = useAppSelector((state) => state.auth);
  const { language } = useAppSelector((state) => state.ui);

  const t = useMemo(() => uiDictionaries[language || 'es'].orders, [language]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartFormValues>({
    resolver: zodResolver(partSchema),
    defaultValues: { quantity: 1 }
  });

  // Hidratación al montar utilizando el parámetro ID de la URL
  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetailsData(id));
    }
  }, [id, dispatch]);

  // Cálculo preciso: laborCost (Mano de obra) + sumatoria de repuestos vinculados (OrderPart)
  const totalAcumulado = useMemo(() => {
    if (!currentOrder) return 0;
    const costoRepuestos = parts.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    return Number(currentOrder.laborCost) + costoRepuestos;
  }, [currentOrder, parts]);

  const onAddPartSubmit = (data: PartFormValues) => {
    if (id) {
      dispatch(addPartToOrder({ orderId: id, data })).then(() => reset());
    }
  };

  if (loading || !currentOrder) {
    return <Typography sx={{ p: 3 }}>Cargando datos estructurales de la orden...</Typography>;
  }

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      
      {/* Información Principal de la Orden (WorkOrder) */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t.orderDetailTitle || 'Detalle de Orden'} - #{currentOrder.id.slice(0, 8)}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{currentOrder.clientName}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Equipo / Marca / Modelo</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentOrder.equipmentType} - {currentOrder.brand} ({currentOrder.model})
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">Número de Serie</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{currentOrder.serialNumber || 'N/A'}</Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">Condición Estética</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{currentOrder.aestheticCondition || 'Sin observaciones'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Falla Reportada</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{currentOrder.reportedFailure}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Diagnóstico Técnico</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{currentOrder.technicalDiagnosis || 'Pendiente de evaluación'}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla del Pañol / Repuestos asociados (OrderPart[]) */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
            <BuildIcon sx={{ mr: 1 }} /> {t.orderPartsTitle || 'Repuestos'}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <form onSubmit={handleSubmit(onAddPartSubmit)}>
            <Grid container sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register('partId')}
                  label="Inventory ID (UUID)"
                  fullWidth
                  size="small"
                  error={!!errors.partId}
                  helperText={errors.partId?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  label="Cantidad"
                  fullWidth
                  size="small"
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Asignar Repuesto
                </Button>
              </Grid>
            </Grid>
          </form>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Clave de Repuesto (nameKey)</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Snapshot</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>{part.nameKey}</TableCell>
                    <TableCell align="right">{part.quantity}</TableCell>
                    <TableCell align="right">${part.unitPrice}</TableCell>
                    <TableCell align="right">${part.quantity * part.unitPrice}</TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => {/* DELETE /orders/:orderId/parts/:partId */}}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Sidebar: Control y Auditoría Cruzada (OrderHistory) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Resumen Financiero</Typography>
            <Typography variant="body2" color="text.secondary">Mano de Obra Base: ${currentOrder.laborCost}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
              Monto Total: ${totalAcumulado}
            </Typography>
          </CardContent>
        </Card>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Estado de la Orden</Typography>
          <Divider sx={{ my: 1 }} />
          
          <FormControl fullWidth size="small" sx={{ my: 2 }}>
            <InputLabel id="status-select-label">Cambiar Estado</InputLabel>
            <Select
              labelId="status-select-label"
              value={currentOrder.status}
              label="Cambiar Estado"
              onChange={(e) => {
                const newStatus = e.target.value as WorkOrderStatus;
                if (newStatus !== currentOrder.status) {
                  // Llamada a la API para actualizar el estado
                  dispatch(updateOrderStatus({id: currentOrder.id, data: {status: newStatus}}));
                }
              }}
                         >
              <MenuItem value="RECEIVED">RECIBIDO</MenuItem>
              <MenuItem value="IN_PROGRESS">EN PROCESO</MenuItem>
              <MenuItem value="READY">LISTO</MenuItem>
              <MenuItem value="DELIVERED">ENTREGADO</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="outlined" 
            color="error" 
            fullWidth 
            disabled={userRole === 'TECH' && currentOrder.status === 'DELIVERED'}
          >
            Cancelar Reparación
          </Button>
        </Paper>

        {/* Historial de Auditoría Real alimentado desde la tabla order_history (OrderHistory[]) */}
        {/* Historial de Auditoría Cruzada Real alimentado desde order_history */}
<Paper elevation={2} sx={{ p: 3 }}>
  <Typography variant="h6" gutterBottom sx={{display: "flex", alignItems: "center"}}>
    <HistoryIcon sx={{ mr: 1 }} /> Línea de Tiempo (Auditoría)
  </Typography>
  <Divider sx={{ my: 1 }} />
  {history.length === 0 ? (
    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
      No hay registros de cambios en esta orden.
    </Typography>
  ) : (
    // Forzamos el tipado estricto en el mapa basado en tu interfaz exacta
    history.map((event: OrderHistory, index: number) => (
      <Box 
        key={index} 
        sx={{ 
          mb: 2, 
          pl: 2, 
          borderLeft: '2px solid',
          borderColor: 'primary.main' // Color unificado de la línea de tiempo corporativa
        }}
      >
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          {/* Formateo rápido o impresión nativa del string ISO/TIMESTAMPTZ */}
          {new Date(event.timestamp).toLocaleString() || event.timestamp}
        </Typography>
        
        {/* Usamos única y estrictamente la propiedad que sí existe en tu servicio */}
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {event.changeDescription}
        </Typography>
        
        {event.notes && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
            Motivo: {event.notes}
          </Typography>
        )}
      </Box>
    ))
  )}
</Paper>
      </Grid>
    </Grid>
  );
};