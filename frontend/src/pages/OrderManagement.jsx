import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Chip, Select, MenuItem, FormControl, InputLabel, Collapse,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, Pagination,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, CheckCircle, Cancel, Refresh } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import StatusChip from "../components/StatusChip";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtCurrency = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function OrderRow({ order, onAction }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow>
        <TableCell><IconButton size="small" onClick={() => setOpen(!open)}>{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton></TableCell>
        <TableCell sx={{ fontWeight: 700 }}>{order.orderNumber}</TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>{order.customer?.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">{order.customer?.email}</Typography>
        </TableCell>
        <TableCell>{fmtDate(order.createdAt)}</TableCell>
        <TableCell>{order.items.length}</TableCell>
        <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{fmtCurrency(order.totalAmount)}</TableCell>
        <TableCell><StatusChip value={order.status} /></TableCell>
        <TableCell>
          {order.status === "Pending" && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => onAction("approve", order._id)}>Approve</Button>
              <Button size="small" variant="outlined" color="error" startIcon={<Cancel />} onClick={() => onAction("reject", order._id)}>Reject</Button>
            </Box>
          )}
          {order.status === "Approved" && <Typography variant="caption" color="success.main">✓ By {order.approvedBy?.fullName}</Typography>}
          {order.status === "Rejected" && <Typography variant="caption" color="error.main">{order.rejectionReason}</Typography>}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} sx={{ py: 0, bgcolor: "#f8faff" }}>
          <Collapse in={open}>
            <Box sx={{ py: 2, px: 3 }}>
              {order.shippingAddress && <Typography variant="body2" sx={{ mb: 1.5 }}><strong>Shipping:</strong> {order.shippingAddress}</Typography>}
              {order.note && <Typography variant="body2" sx={{ mb: 1.5 }}><strong>Note:</strong> {order.note}</Typography>}
              <Table size="small">
                <TableHead><TableRow><TableCell>Product</TableCell><TableCell>SKU</TableCell><TableCell align="right">Qty</TableCell><TableCell align="right">Price</TableCell><TableCell align="right">Subtotal</TableCell></TableRow></TableHead>
                <TableBody>
                  {order.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell><Typography variant="caption">{item.sku}</Typography></TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{fmtCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{fmtCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState({ open: false, orderId: null });
  const [rejectReason, setRejectReason] = useState("");

  const fetchOrders = useCallback(() => {
    setLoading(true);
    axios.get("/api/orders", { params: { status: statusFilter, page, limit: 15 } })
      .then((r) => { setOrders(r.data.orders); setTotalPages(r.data.pages); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleAction = async (action, orderId, reason = "") => {
    try {
      if (action === "approve") {
        await axios.put(`/api/orders/${orderId}/approve`);
        toast.success("Order approved — stock deducted ✅");
      } else {
        await axios.put(`/api/orders/${orderId}/reject`, { rejectionReason: reason });
        toast.success("Order rejected");
      }
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || "Action failed"); }
  };

  const handleRejectSubmit = () => {
    handleAction("reject", rejectDialog.orderId, rejectReason);
    setRejectDialog({ open: false, orderId: null });
    setRejectReason("");
  };

  const handleRowAction = (action, orderId) => {
    if (action === "reject") { setRejectDialog({ open: true, orderId }); }
    else { handleAction(action, orderId); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4">Order Management</Typography>
          <Typography color="text.secondary">{total} total orders</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchOrders}>Refresh</Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select label="Status Filter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">All Orders</MenuItem>
            <MenuItem value="Pending">⏳ Pending</MenuItem>
            <MenuItem value="Approved">✅ Approved</MenuItem>
            <MenuItem value="Rejected">❌ Rejected</MenuItem>
            <MenuItem value="Cancelled">🚫 Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        <Table>
          <TableHead><TableRow>
            <TableCell />
            <TableCell>Order #</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>Loading...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>No orders found</TableCell></TableRow>
            ) : (
              orders.map((o) => <OrderRow key={o._id} order={o} onAction={handleRowAction} />)
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, orderId: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Rejection Reason" value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)} sx={{ mt: 1 }} placeholder="Explain why you are rejecting this order..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, orderId: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectSubmit}>Reject Order</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
