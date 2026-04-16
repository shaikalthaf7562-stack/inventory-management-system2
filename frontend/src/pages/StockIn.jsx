import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Alert, Table,
  TableHead, TableBody, TableRow, TableCell, Chip,
} from "@mui/material";
import { ArrowDownward, Save } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import StatusChip from "../components/StatusChip";

const REASONS = ["Purchase", "Return from Customer", "Transfer In", "Adjustment", "Opening Stock", "Other"];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function StockIn() {
  const [products, setProducts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [form, setForm] = useState({ productId: "", quantity: "", reason: "Purchase", note: "" });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/products", { params: { limit: 500 } }).then((r) => setProducts(r.data.products));
    fetchRecent();
  }, []);

  const fetchRecent = () => {
    axios.get("/api/stock/movements", { params: { type: "IN", limit: 15 } })
      .then((r) => setRecent(r.data.movements.filter((m) => m.type === "IN")));
  };

  const handleProductChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, productId: id });
    setSelected(products.find((p) => p._id === id) || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.quantity || Number(form.quantity) <= 0) return toast.error("Select product and enter valid quantity");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/stock/adjust", { productId: form.productId, type: "IN", quantity: Number(form.quantity), reason: form.reason, note: form.note });
      toast.success(`✅ ${form.quantity} units added. New stock: ${data.newStock}`);
      setSelected((p) => p ? { ...p, currentStock: data.newStock } : null);
      setProducts((prev) => prev.map((p) => p._id === form.productId ? { ...p, currentStock: data.newStock } : p));
      setForm((f) => ({ ...f, quantity: "", note: "" }));
      fetchRecent();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: "success.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowDownward sx={{ color: "#fff" }} />
        </Box>
        <Box>
          <Typography variant="h4">Stock In</Typography>
          <Typography color="text.secondary" variant="body2">Receive / add stock to inventory</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Entry form */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Add Stock Entry</Typography>
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Product *</InputLabel>
                  <Select label="Select Product *" value={form.productId} onChange={handleProductChange} required>
                    {products.map((p) => (
                      <MenuItem key={p._id} value={p._id}>{p.name} [{p.sku}]</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selected && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Current stock: <strong>{selected.currentStock}</strong> units &nbsp;·&nbsp; SKU: <strong>{selected.sku}</strong>
                  </Alert>
                )}

                <TextField fullWidth label="Quantity to Add *" type="number" inputProps={{ min: 1 }} value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} sx={{ mb: 2 }} required />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Reason *</InputLabel>
                  <Select label="Reason *" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                    {REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>

                <TextField fullWidth label="Note (optional)" value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })} sx={{ mb: 3 }} placeholder="e.g. Invoice #1234, Supplier batch..." />

                <Button type="submit" variant="contained" color="success" fullWidth size="large" startIcon={<Save />} disabled={loading}>
                  {loading ? "Adding stock..." : "Confirm Stock In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent IN movements */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Recent Stock In</Typography>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Product</TableCell><TableCell align="right">Qty</TableCell>
                  <TableCell>Reason</TableCell><TableCell>By</TableCell><TableCell>When</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {recent.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>No stock-in records yet</TableCell></TableRow>
                  ) : recent.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{m.product?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.product?.sku}</Typography>
                      </TableCell>
                      <TableCell align="right"><Chip label={`+${m.quantity}`} size="small" color="success" /></TableCell>
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
