import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Grid, Card, CardMedia, CardContent, CardActions,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Pagination, InputAdornment, LinearProgress,
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import StatusChip from "../components/StatusChip";

const fmtCurrency = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function StockChip({ product }) {
  if (product.currentStock === 0)
    return <Chip label="Out of Stock" color="error" size="small" />;
  if (product.currentStock <= product.lowStockThreshold)
    return <Chip label={`Low: ${product.currentStock}`} color="warning" size="small" />;
  return <Chip label={`${product.currentStock} in stock`} color="success" size="small" variant="outlined" />;
}

export default function ProductsList() {
  const { user } = useAuth();
  const isAdmin  = user.role === "admin";
  const canManage = isAdmin || user.canManageInventory;

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/products", {
        params: { search, category, stockFilter, page, limit: 12 },
      });
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, [search, category, stockFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    axios.get("/api/products/categories").then((r) => setCategories(r.data));
  }, []);

  const handleDiscontinue = async (id) => {
    if (!window.confirm("Mark as Discontinued?")) return;
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success("Product discontinued");
      fetchProducts();
    } catch { toast.error("Failed"); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4">Products</Typography>
          <Typography color="text.secondary" variant="body2">{total} products total</Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<Add />} component={Link} to="/products/add">
            Add Product
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search name, SKU, category..."
          size="small" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Stock Level</InputLabel>
          <Select label="Stock Level" value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">All Levels</MenuItem>
            <MenuItem value="healthy">✅ Healthy</MenuItem>
            <MenuItem value="low">⚠️ Low Stock</MenuItem>
            <MenuItem value="out">🚫 Out of Stock</MenuItem>
          </Select>
        </FormControl>
        {(search || category || stockFilter) && (
          <Button variant="outlined" size="small" onClick={() => { setSearch(""); setCategory(""); setStockFilter(""); setPage(1); }}>
            Clear
          </Button>
        )}
      </Box>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      {!loading && products.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h2">📦</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>No products found</Typography>
          {canManage && <Button variant="contained" sx={{ mt: 2 }} component={Link} to="/products/add">Add First Product</Button>}
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {products.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.18s,box-shadow 0.18s", "&:hover": { transform: "translateY(-3px)", boxShadow: 6 } }}>
                <Box sx={{ height: 150, bgcolor: "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
                  {p.imageUrl
                    ? <CardMedia component="img" image={p.imageUrl} alt={p.name} sx={{ height: 150, objectFit: "cover" }} />
                    : <Typography sx={{ fontSize: "3rem" }}>📦</Typography>}
                </Box>
                <CardContent sx={{ flex: 1, pb: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ flex: 1, mr: 0.5 }}>{p.name}</Typography>
                    <StatusChip value={p.status} />
                  </Box>
                  <Typography variant="caption" sx={{ fontFamily: "monospace", bgcolor: "#f0f0ff", px: 0.75, py: 0.25, borderRadius: 1, display: "inline-block", mb: 0.5 }}>
                    {p.sku}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">{p.category || "Uncategorized"}</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={800} sx={{ mt: 0.5 }}>{fmtCurrency(p.unitPrice)}</Typography>
                  <Box sx={{ mt: 0.5 }}><StockChip product={p} /></Box>
                  {p.lastUpdatedBy && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Updated by {p.lastUpdatedBy.fullName}
                    </Typography>
                  )}
                </CardContent>
                {canManage && (
                  <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
                    <Button size="small" variant="outlined" startIcon={<Edit />} component={Link} to={`/products/edit/${p._id}`} sx={{ flex: 1 }}>Edit</Button>
                    {isAdmin && <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDiscontinue(p._id)}>Drop</Button>}
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
