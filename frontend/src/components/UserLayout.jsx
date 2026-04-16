import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Box, Button, IconButton,
  Badge, Avatar, Menu, MenuItem, Divider, Container,
} from "@mui/material";
import { ShoppingCart, Store, ListAlt, Dashboard, Logout, Person } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function UserLayout() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => { logout(); toast.success("Goodbye!"); navigate("/login"); };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} sx={{
        background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <Toolbar sx={{ gap: 1 }}>
          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 3 }}>
            <Box sx={{ fontSize: "1.5rem" }}>📦</Box>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>IMS Store</Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
            {[
              { to: "/user-dashboard", icon: <Dashboard fontSize="small" />, label: "Dashboard" },
              { to: "/shop",     icon: <Store fontSize="small" />,   label: "Shop" },
              { to: "/my-orders",icon: <ListAlt fontSize="small" />, label: "My Orders" },
            ].map(({ to, icon, label }) => (
              <Button key={to} component={NavLink} to={to} startIcon={icon}
                sx={{
                  color: "rgba(255,255,255,0.75)", fontWeight: 500, fontSize: "0.875rem",
                  "&.active": { color: "#fff", background: "rgba(255,255,255,0.15)" },
                  "&:hover":  { color: "#fff", background: "rgba(255,255,255,0.1)" },
                  borderRadius: 2,
                }}>
                {label}
              </Button>
            ))}
          </Box>

          {/* Cart & avatar */}
          <IconButton component={NavLink} to="/cart" sx={{ color: "#fff" }}>
            <Badge badgeContent={totalItems} color="warning"><ShoppingCart /></Badge>
          </IconButton>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "rgba(255,255,255,0.25)", fontSize: "0.9rem" }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: 4 } }}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate("/profile"); setAnchorEl(null); }}>
              <Person fontSize="small" sx={{ mr: 1.5 }} />Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <Logout fontSize="small" sx={{ mr: 1.5 }} />Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
