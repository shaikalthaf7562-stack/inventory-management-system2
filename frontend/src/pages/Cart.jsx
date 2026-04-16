import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, TextField,
  Divider, Grid, Alert,
} from "@mui/material";
import { Add, Remove, Delete, ShoppingCartCheckout, Store } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, updateQty, removeFromCart, clearCart, totalAmount } = useCart();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return toast.error("Cart is empty");
    setLoading(true);
    try {
      await axios.post("/api/orders", {
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        note, shippingAddress: address,
      });
      clearCart();
      toast.success("Order placed! Waiting for approval 🎉");
      navigate("/my-orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h1" sx={{ fontSize: "5rem", mb: 2 }}>🛒</Typography>
        <Typography variant="h5" sx={{ mb: 1 }}>Your cart is empty</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Browse our products and add items to your cart</Typography>
        <Button variant="contained" startIcon={<Store />} component={Link} to="/shop">Browse Products</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>🛒 Your Cart</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        After checkout, your order will be reviewed and approved by our team. Stock will be deducted upon approval.
      </Alert>

      <Grid container spacing={3}>
        {/* Cart items */}
        <Grid item xs={12} md={8}>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.product._id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                          {item.product.imageUrl
                            ? <img src={item.product.imageUrl} alt="" style={{ width: 48, height: 48, objectFit: "cover" }} />
                            : <Typography>📦</Typography>}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2">{item.product.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.product.sku}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                        <IconButton size="small" onClick={() => updateQty(item.product._id, item.quantity - 1)}><Remove fontSize="small" /></IconButton>
                        <Typography sx={{ width: 32, textAlign: "center", fontWeight: 700 }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQty(item.product._id, item.quantity + 1)} disabled={item.quantity >= item.product.currentStock}><Add fontSize="small" /></IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary">max {item.product.currentStock}</Typography>
                    </TableCell>
                    <TableCell align="right">₹{item.product.unitPrice?.toLocaleString("en-IN")}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>
                      ₹{(item.product.unitPrice * item.quantity).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => removeFromCart(item.product._id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        {/* Order summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Order Summary</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography color="text.secondary">Items ({items.length})</Typography>
                <Typography fontWeight={600}>₹{totalAmount.toLocaleString("en-IN")}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography variant="h6" color="primary.main" fontWeight={800}>₹{totalAmount.toLocaleString("en-IN")}</Typography>
              </Box>

              <TextField fullWidth size="small" label="Shipping Address" multiline rows={2} value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth size="small" label="Order Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} sx={{ mb: 2.5 }} />

              <Button variant="contained" fullWidth size="large" startIcon={<ShoppingCartCheckout />} onClick={handleCheckout} disabled={loading}>
                {loading ? "Placing order..." : "Place Order"}
              </Button>
              <Button variant="text" fullWidth sx={{ mt: 1 }} color="error" onClick={clearCart}>Clear Cart</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
