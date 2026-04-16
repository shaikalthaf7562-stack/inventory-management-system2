import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button, LinearProgress, Chip } from "@mui/material";
import { Store, ListAlt } from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import StatusChip from "../components/StatusChip";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtCurrency = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => { axios.get("/api/dashboard").then((r) => setData(r.data)); }, []);

  if (!data) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Welcome, {user.name} 👋</Typography>
        <Typography color="text.secondary">Track your orders and explore our products</Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}><StatCard icon="📦" label="Total Orders" value={data.totalOrders} color="#4f46e5" /></Grid>
        <Grid item xs={12} sm={4}><StatCard icon="⏳" label="Pending Orders" value={data.pendingOrders} color="#d97706" /></Grid>
        <Grid item xs={12} sm={4}><StatCard icon="✅" label="Approved Orders" value={data.approvedOrders} color="#059669" /></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle1">Recent Orders</Typography>
                <Button size="small" component={Link} to="/my-orders" startIcon={<ListAlt />}>View All</Button>
              </Box>
              {data.myOrders?.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">No orders yet. Start shopping!</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} component={Link} to="/shop">Shop Now</Button>
                </Box>
              ) : (
                data.myOrders?.map((o) => (
                  <Box key={o._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid #f0f0ff" }}>
                    <Box>
                      <Typography variant="subtitle2">{o.orderNumber}</Typography>
                      <Typography variant="caption" color="text.secondary">{fmtDate(o.createdAt)} · {o.items.length} item(s)</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography fontWeight={700} color="primary.main">{fmtCurrency(o.totalAmount)}</Typography>
                      <StatusChip value={o.status} />
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", mb: 2 }}>
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Typography sx={{ fontSize: "3rem", mb: 1 }}>🛍️</Typography>
              <Typography variant="h6" sx={{ color: "#fff", mb: 0.5 }}>Ready to shop?</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", mb: 2 }}>Browse our latest products</Typography>
              <Button variant="contained" component={Link} to="/shop" startIcon={<Store />}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }, boxShadow: "none" }}>
                Go to Shop
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Order Status Guide</Typography>
              {[["Pending","Your order is awaiting approval"],["Approved","Approved & stock deducted"],["Rejected","Not approved — see reason"],["Cancelled","Cancelled by you"]].map(([s, desc]) => (
                <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <StatusChip value={s} />
                  <Typography variant="caption" color="text.secondary">{desc}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
