import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, AppBar, Typography, IconButton, Avatar, Menu, MenuItem,
  Collapse, Divider, Badge, Tooltip,
} from "@mui/material";
import {
  Dashboard, Inventory2, AddBox, ArrowDownward, ArrowUpward,
  Assessment, LocalShipping, Group, ShoppingBag, Person,
  Logout, ExpandLess, ExpandMore, Menu as MenuIcon, SwapVert,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const DRAWER_WIDTH = 252;

const NavItem = ({ to, icon, label, indent = false }) => (
  <ListItemButton
    component={NavLink}
    to={to}
    sx={{
      mx: 1, borderRadius: 2, mb: 0.3,
      pl: indent ? 5 : 2,
      color: "rgba(255,255,255,0.7)",
      "&.active": {
        background: "linear-gradient(135deg,rgba(99,102,241,0.7),rgba(139,92,246,0.7))",
        color: "#fff",
        "& .MuiListItemIcon-root": { color: "#fff" },
      },
      "&:hover": { background: "rgba(255,255,255,0.1)", color: "#fff" },
    }}
  >
    <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{icon}</ListItemIcon>
    <ListItemText primary={label} primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }} />
  </ListItemButton>
);

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stockOpen, setStockOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const isAdmin = user?.role === "admin";

  const handleLogout = () => { logout(); toast.success("Logged out"); navigate("/login"); };

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand */}
      <Box sx={{ p: 2.5, pt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, background: "linear-gradient(135deg,#818cf8,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>📦</Box>
          <Box>
            <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.1 }}>IMS Pro</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {isAdmin ? "Administrator" : "Employee"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />

      <List sx={{ flex: 1, pt: 1, overflowY: "auto" }}>
        <Typography sx={{ px: 2.5, py: 0.5, color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Main</Typography>
        <NavItem to="/dashboard" icon={<Dashboard fontSize="small" />} label="Dashboard" />
        <NavItem to="/products"  icon={<Inventory2 fontSize="small" />} label="Products" />
        <NavItem to="/orders"    icon={<ShoppingBag fontSize="small" />} label="Orders" />

        <Typography sx={{ px: 2.5, py: 0.5, mt: 1, color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Stock</Typography>
        <ListItemButton onClick={() => setStockOpen(!stockOpen)} sx={{ mx: 1, borderRadius: 2, color: "rgba(255,255,255,0.7)", "&:hover": { background: "rgba(255,255,255,0.1)" } }}>
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}><SwapVert fontSize="small" /></ListItemIcon>
          <ListItemText primary="Stock Management" primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }} />
          {stockOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </ListItemButton>
        <Collapse in={stockOpen}>
          <NavItem to="/stock/in"        icon={<ArrowDownward fontSize="small" />} label="Stock In"        indent />
          <NavItem to="/stock/out"       icon={<ArrowUpward fontSize="small" />}   label="Stock Out"       indent />
          <NavItem to="/stock/movements" icon={<SwapVert fontSize="small" />}      label="Movements Log"   indent />
          <NavItem to="/stock/report"    icon={<Assessment fontSize="small" />}    label="Stock Report"    indent />
        </Collapse>

        <Typography sx={{ px: 2.5, py: 0.5, mt: 1, color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Setup</Typography>
        <NavItem to="/suppliers" icon={<LocalShipping fontSize="small" />} label="Suppliers" />
        {isAdmin && <NavItem to="/employees" icon={<AdminPanelSettings fontSize="small" />} label="Employees" />}

        <Typography sx={{ px: 2.5, py: 0.5, mt: 1, color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Account</Typography>
        <NavItem to="/profile" icon={<Person fontSize="small" />} label="My Profile" />
      </List>

      {/* User footer */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: "#818cf8", fontSize: "0.85rem" }}>
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={handleLogout} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#f87171" } }}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}>
        {sidebar}
      </Drawer>
      <Box component="main" sx={{ flex: 1, minWidth: 0, p: 3, pt: 2.5 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
