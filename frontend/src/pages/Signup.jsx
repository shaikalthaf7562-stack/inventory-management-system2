import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Grid } from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/signup", form);
      login(data);
      toast.success("Account created! Welcome 🎉");
      navigate("/shop");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally { setLoading(false); }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 60%,#7c3aed 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", p: 2,
    }}>
      <Card sx={{ width: "100%", maxWidth: 500, borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", py: 2.5, textAlign: "center" }}>
          <PersonAdd sx={{ fontSize: 40, color: "#fff", mb: 0.5 }} />
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800 }}>Create Account</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.83rem" }}>Sign up to start shopping</Typography>
        </Box>

        <CardContent sx={{ p: 3.5 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" required {...f("fullName")} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email Address" type="email" required {...f("email")} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Password" type="password" required {...f("password")} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Confirm Password" type="password" required {...f("confirmPassword")} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone (optional)" {...f("phone")} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address (optional)" multiline rows={2} {...f("address")} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </Grid>
            </Grid>
          </form>
          <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
