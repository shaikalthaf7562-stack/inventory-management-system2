import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Alert, Divider, Avatar, Chip,
} from "@mui/material";
import { Lock, Save } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handlePwChange = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) return setError("New passwords do not match");
    if (pwForm.newPassword.length < 6) return setError("Password must be at least 6 characters");
    setSaving(true);
    try {
      await axios.put("/api/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setSuccess("Password updated successfully!");
      toast.success("Password changed ✅");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally { setSaving(false); }
  };

  const roleColor = user?.role === "admin" ? "secondary" : user?.role === "employee" ? "primary" : "success";

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>My Profile</Typography>

      <Grid container spacing={3}>
        {/* Account info */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Avatar sx={{
                width: 80, height: 80, mx: "auto", mb: 2, fontSize: "2rem",
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight={700}>{user?.name}</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 1.5 }}>{user?.email}</Typography>
              <Chip label={user?.role?.toUpperCase()} color={roleColor} size="small" sx={{ fontWeight: 700 }} />
              {user?.department && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  🏢 {user.department}
                </Typography>
              )}
              {user?.role === "employee" && (
                <Box sx={{ mt: 1.5 }}>
                  <Chip
                    label={user.canManageInventory ? "Can Manage Inventory" : "View Only"}
                    color={user.canManageInventory ? "success" : "default"}
                    size="small" variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
            <Divider />
            <CardContent>
              {[
                ["Role", user?.role],
                ["Email", user?.email],
                ...(user?.department ? [["Department", user.department]] : []),
              ].map(([label, val]) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{val}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Change password */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock sx={{ color: "#fff", fontSize: "1.2rem" }} />
                </Box>
                <Typography variant="h6">Change Password</Typography>
              </Box>

              {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handlePwChange}>
                <TextField fullWidth label="Current Password" type="password" required
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  sx={{ mb: 2.5 }} />
                <TextField fullWidth label="New Password" type="password" required
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  helperText="Minimum 6 characters"
                  sx={{ mb: 2.5 }} />
                <TextField fullWidth label="Confirm New Password" type="password" required
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  sx={{ mb: 3 }} />
                <Button type="submit" variant="contained" size="large" startIcon={<Save />} disabled={saving}>
                  {saving ? "Saving..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
