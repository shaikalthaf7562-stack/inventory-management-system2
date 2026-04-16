import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Alert, Table,
  TableHead, TableBody, TableRow, TableCell, Chip,
} from "@mui/material";
import { ArrowUpward, Save } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const REASONS = ["Sale", "Damage", "Expired", "Transfer Out", "Adjustment", "Wastage", "Other"];
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function StockOut() {
  const [products, setProducts] = useState([]);
  const [recent, setRecent]     = useState([]);
  const [form, setForm]         = useState({ productId: "", quantity: "", reason: "Sale", note: "" });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    axios.get("/api/products", { params: { limit: 500 } }).then((r) => setProducts(r.data.products));
    fetchRecent();
  }, []);

  const fetchRecent = () => {
    axios.get("/api/stock/movements", { params: { limit: 15 } })
      .then((r) => setRecent(r.data.movements.filter((m) => m.type === "OUT")));
  };

  const handleProductChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, productId: id, quantity: "" });
    setSelected(products.find((p) => p._id === id) || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.quantity || Number(form.quantity) <= 0)
      return toast.error("Select a product and enter valid quantity");
    if (selected && Number(form.quantity) > selected.currentStock)
      return toast.error(`Cannot exceed available stock (${selected.currentStock})`);
    setLoading(true);
    try {
      const { data } = await axios.post("/api/stock/adjust", {
        productId: form.productId, type: "OUT",
        quantity: Number(form.quantity), reason: form.reason, note: form.note,
      });
      toast.success(`✅ ${form.quantity} units removed. Remaining: ${data.newStock}`);
      setSelected((p) => p ? { ...p, currentStock: data.newStock } : null);
      setProducts((prev) =>
        prev.map((p) => p._id === form.productId ? { ...p, currentStock: data.newStock } : p)
      );
      setForm((f) => ({ ...f, quantity: "", note: "" }));
      fetchRecent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Stock-out failed");
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: "error.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowUpward sx={{ color: "#fff" }} />
        </Box>
        <Box>
          <Typography variant="h4">Stock Out</Typography>
          <Typography color="text.secondary" variant="body2">Record manual stock deductions</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Entry form */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Record Stock Deduction</Typography>
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Product *</InputLabel>
                  <Select label="Select Product *" value={form.productId} onChange={handleProductChange} required>
                    {products.map((p) => (
                      <MenuItem key={p._id} value={p._id} disabled={p.currentStock === 0}>
                        {p.name} [{p.sku}] — {p.currentStock} in stock
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selected && (
                  <Alert severity={selected.currentStock === 0 ? "error" : selected.currentStock <= selected.lowStockThreshold ? "warning" : "success"} sx={{ mb: 2 }}>
                    Available stock: <strong>{selected.currentStock}</strong> units
                    {selected.currentStock <= selected.lowStockThreshold && selected.currentStock > 0 && " ⚠️ Low stock"}
                    {selected.currentStock === 0 && " — Cannot deduct from empty stock"}
                  </Alert>
                )}

                <TextField
                  fullWidth label="Quantity to Deduct *" type="number"
                  inputProps={{ min: 1, max: selected?.currentStock }}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  sx={{ mb: 2 }} required
                  disabled={selected?.currentStock === 0}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Reason *</InputLabel>
                  <Select label="Reason *" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                    {REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth label="Note (optional)" value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  sx={{ mb: 3 }} placeholder="e.g. Sales invoice, damaged batch ref..."
                />

                <Button
                  type="submit" variant="contained" color="error" fullWidth size="large"
                  startIcon={<Save />} disabled={loading || selected?.currentStock === 0}
                >
                  {loading ? "Processing..." : "Confirm Stock Out"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent OUT movements */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Recent Stock Out</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>By</TableCell>
                    <TableCell>When</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No stock-out records yet
                      </TableCell>
                    </TableRow>
                  ) : recent.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{m.product?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.product?.sku}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`-${m.quantity}`} size="small" color="error" />
                      </TableCell>
                      <TableCell><Typography variant="caption">{m.reason}</Typography></TableCell>
                      <TableCell><Typography variant="caption">{m.performedBy?.fullName}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{fmtDate(m.createdAt)}</Typography>
                      </TableCell>
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
