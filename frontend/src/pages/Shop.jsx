import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Grid, Card, CardMedia, CardContent, CardActions,
  Typography, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Chip, Pagination, Badge, Tooltip, InputAdornment,
} from "@mui/material";
import { AddShoppingCart, Search, FilterList } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

export default function Shop() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/products", { params: { search, category, page, limit: 12 } });
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { axios.get("/api/products/categories").then((r) => setCategories(r.data)); }, []);

  const handleAddToCart = (product) => {
    if (product.currentStock === 0) return toast.error("Out of stock");
    addToCart(product, 1);
    toast.success(`"${product.name}" added to cart!`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>🛍️ Shop</Typography>
        <Typography color="text.secondary">{total} products available</Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search products..." size="small"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        {(search || category) && (
          <Button variant="outlined" size="small" onClick={() => { setSearch(""); setCategory(""); setPage(1); }}>Clear</Button>
        )}
      </Box>

      {loading ? (
        <Grid container spacing={2.5}>
          {Array(8).fill(0).map((_, i) => <Grid item xs={12} sm={6} md={4} lg={3} key={i}><Card sx={{ height: 320 }} /></Grid>)}
        </Grid>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h2" sx={{ mb: 1 }}>📦</Typography>
          <Typography color="text.secondary">No products found</Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {products.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.18s, box-shadow 0.18s", "&:hover": { transform: "translateY(-3px)", boxShadow: 6 } }}>
                {/* Image */}
                <Box sx={{ height: 180, background: "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
                  {p.imageUrl
                    ? <CardMedia component="img" image={p.imageUrl} alt={p.name} sx={{ height: 180, objectFit: "cover" }} />
                    : <Typography sx={{ fontSize: "3.5rem" }}>📦</Typography>}
                </Box>

                <CardContent sx={{ flex: 1, pb: 1 }}>
                  <Typography variant="subtitle2" noWrap title={p.name}>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>{p.category || "General"}</Typography>
                  <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 800 }}>
                    ₹{p.unitPrice?.toLocaleString("en-IN")}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={p.currentStock === 0 ? "Out of Stock" : `${p.currentStock} in stock`}
                      size="small"
                      color={p.currentStock === 0 ? "error" : p.currentStock <= p.lowStockThreshold ? "warning" : "success"}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Tooltip title={p.currentStock === 0 ? "Out of stock" : "Add to cart"}>
                    <span style={{ width: "100%" }}>
                      <Button
                        variant="contained" fullWidth size="small"
                        startIcon={<AddShoppingCart />}
                        disabled={p.currentStock === 0}
                        onClick={() => handleAddToCart(p)}
                      >
                        {p.currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </span>
                  </Tooltip>
                </CardActions>
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
