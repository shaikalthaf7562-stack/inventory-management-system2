import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Alert,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";

const emptyForm = {
  name: "", sku: "", category: "", description: "",
  unitPrice: "", currentStock: "0", lowStockThreshold: "10",
  reorderLevel: "5", supplier: "", imageUrl: "", status: "Active",
};

export function ProductForm({ initialData = emptyForm, productId = null }) {
  const navigate = useNavigate();
  const [form, setForm]         = useState(initialData);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    axios.get("/api/suppliers").then((r) => setSuppliers(r.data));
  }, []);

  const f = (field) => ({
    value: form[field] ?? "",
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.sku) return setError("Product name and SKU are required");
    if (Number(form.unitPrice) < 0) return setError("Price cannot be negative");
    setLoading(true);
    try {
      if (productId) {
        await axios.put(`/api/products/${productId}`, form);
        toast.success("Product updated successfully!");
      } else {
        await axios.post("/api/products", form);
        toast.success("Product added successfully!");
      }
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally { setLoading(false); }
  };

  return (
    <Card sx={{ maxWidth: 760 }}>
      <CardContent sx={{ p: 3.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Product Name *" required {...f("name")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="SKU / Code *" required {...f("sku")} placeholder="e.g. PROD-001" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Category" {...f("category")} placeholder="e.g. Electronics" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select label="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                  <MenuItem value="">— No Supplier —</MenuItem>
                  {suppliers.map((s) => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} {...f("description")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Unit Price (₹) *" type="number" inputProps={{ min: 0, step: "0.01" }} required {...f("unitPrice")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Current Stock *" type="number" inputProps={{ min: 0 }} required {...f("currentStock")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Low Stock Threshold" type="number" inputProps={{ min: 0 }} {...f("lowStockThreshold")} helperText="Alert when stock falls below this" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Reorder Level" type="number" inputProps={{ min: 0 }} {...f("reorderLevel")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Discontinued">Discontinued</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Image URL (optional)" {...f("imageUrl")} placeholder="https://example.com/img.jpg" />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Button type="submit" variant="contained" size="large" startIcon={<Save />} disabled={loading}>
                  {loading ? "Saving..." : productId ? "Update Product" : "Add Product"}
                </Button>
                <Button variant="outlined" size="large" startIcon={<Cancel />} onClick={() => navigate("/products")}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AddProduct() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>➕ Add New Product</Typography>
      <ProductForm />
    </Box>
  );
}
