import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead,
  TableBody, TableRow, TableCell, Button, Chip, Collapse,
  IconButton, Alert,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, Cancel } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import StatusChip from "../components/StatusChip";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtCurrency = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function OrderRow({ order, onCancel }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 700 }}>{order.orderNumber}</TableCell>
        <TableCell>{fmtDate(order.createdAt)}</TableCell>
        <TableCell>{order.items.length} item(s)</TableCell>
        <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{fmtCurrency(order.totalAmount)}</TableCell>
        <TableCell><StatusChip value={order.status} /></TableCell>
        <TableCell>
          {order.status === "Pending" && (
            <Button size="small" color="error" startIcon={<Cancel />} onClick={() => onCancel(order._id)}>Cancel</Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, bgcolor: "#f8faff" }}>
          <Collapse in={open}>
            <Box sx={{ py: 2, px: 3 }}>
              {order.status === "Rejected" && order.rejectionReason && (
                <Alert severity="error" sx={{ mb: 1.5 }}>Rejection reason: {order.rejectionReason}</Alert>
              )}
              {order.shippingAddress && (
                <Typography variant="body2" sx={{ mb: 1 }}><strong>Ship to:</strong> {order.shippingAddress}</Typography>
              )}
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Product</TableCell><TableCell>SKU</TableCell>
                  <TableCell align="right">Qty</TableCell><TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {order.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{item.sku}</Typography></TableCell>
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

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    axios.get("/api/orders").then((r) => setOrders(r.data.orders)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await axios.put(`/api/orders/${id}/cancel`);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || "Cancel failed"); }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>📋 My Orders</Typography>
      {orders.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h2">📦</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>You have no orders yet</Typography>
        </Box>
      ) : (
        <Card>
          <Table>
            <TableHead><TableRow>
              <TableCell />
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {orders.map((o) => <OrderRow key={o._id} order={o} onCancel={handleCancel} />)}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
}
