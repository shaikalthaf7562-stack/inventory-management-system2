import React, { useEffect, useState } from "react";
import {
  Box, Grid, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableHead, TableRow, Button, LinearProgress, Paper,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import StatusChip from "../components/StatusChip";

const fmtCurrency = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios.get("/api/dashboard").then((r) => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  if (loading || !data) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography color="text.secondary" variant="body2">Welcome back, {user.name} 👋</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} component={Link} to="/products/add">Add Product</Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard icon="📦" label="Total Products"    value={data.totalProducts}  color="#4f46e5" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon="⚠️" label="Low Stock Items"   value={data.lowStockItems}  color="#d97706" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon="🛒" label="Pending Orders"    value={data.pendingOrders}  color="#dc2626" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon="💰" label="Inventory Value"   value={fmtCurrency(data.totalValue)} color="#059669" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon="👥" label="Registered Users"  value={data.totalUsers}     color="#7c3aed" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon="🏭" label="Suppliers"         value={data.totalSuppliers} color="#0284c7" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon="🚫" label="Out of Stock"      value={data.outOfStock}     color="#dc2626" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon="✅" label="Approved Today"    value={data.recentMovements?.filter(m => m.type === "OUT").length ?? 0} color="#059669" /></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Pending orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle1">🛒 Pending Orders</Typography>
                <Button size="small" component={Link} to="/orders">View All</Button>
              </Box>
              {data.recentOrders?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>No pending orders 🎉</Typography>
              ) : (
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Order</TableCell><TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell><TableCell>Status</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {data.recentOrders?.map((o) => (
                      <TableRow key={o._id}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>{o.orderNumber}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem" }}>{o.customer?.fullName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{fmtCurrency(o.totalAmount)}</TableCell>
                        <TableCell><StatusChip value={o.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Low stock */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle1">⚠️ Low Stock Alerts</Typography>
                <Button size="small" component={Link} to="/stock/report">Report</Button>
              </Box>
              {data.lowStockList?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>All products well-stocked ✅</Typography>
              ) : (
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Product</TableCell><TableCell align="right">Stock</TableCell><TableCell align="right">Min</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {data.lowStockList?.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{p.sku}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700} color={p.currentStock === 0 ? "error.main" : "warning.main"}>{p.currentStock}</Typography>
                        </TableCell>
                        <TableCell align="right"><Typography variant="body2" color="text.secondary">{p.lowStockThreshold}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent movements */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>🔄 Recent Stock Movements</Typography>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Product</TableCell><TableCell>Type</TableCell>
                  <TableCell align="right">Qty</TableCell><TableCell>Reason</TableCell>
                  <TableCell>By</TableCell><TableCell>When</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {data.recentMovements?.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>No movements yet</TableCell></TableRow>
                  )}
                  {data.recentMovements?.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell><Typography variant="body2" fontWeight={600}>{m.product?.name}</Typography><Typography variant="caption" color="text.secondary">{m.product?.sku}</Typography></TableCell>
                      <TableCell><StatusChip value={m.type} /></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{m.quantity}</TableCell>
                      <TableCell><Typography variant="caption">{m.reason}</Typography></TableCell>
                      <TableCell><Typography variant="caption">{m.performedBy?.fullName}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{fmtDate(m.createdAt)}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
