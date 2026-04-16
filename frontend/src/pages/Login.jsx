import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Divider } from "@mui/material";
import { Inventory2 } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", form);
      login(data);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate(data.user.role === "user" ? "/shop" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 70%,#7c3aed 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", p: 2,
    }}>
      <Card sx={{ width: "100%", maxWidth: 420, borderRadius: 4, overflow: "hidden" }}>
        {/* Header strip */}
        <Box sx={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", py: 3, textAlign: "center" }}>
          <Inventory2 sx={{ fontSize: 44, color: "#fff", mb: 0.5 }} />
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800 }}>IMS Pro</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>Inventory Management System</Typography>
        </Box>

        <CardContent sx={{ p: 3.5 }}>
          <Typography variant="h6" sx={{ mb: 2.5 }}>Sign In</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email Address" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{ mb: 2 }} required />
            <TextField fullWidth label="Password" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              sx={{ mb: 3 }} required />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </Button>
          </form>

          <Divider sx={{ my: 2.5 }} />

          {/* <Alert severity="info" sx={{ mb: 2, "& .MuiAlert-message": { fontSize: "0.82rem" } }}>
            <strong>Admin:</strong> admin@ims.com / admin@2025
          </Alert> */}

          <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
            New customer?{" "}
            <Link to="/signup" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>
              Create account
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
