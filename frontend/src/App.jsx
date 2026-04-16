import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { CircularProgress, Box } from "@mui/material";

// Layouts
import StaffLayout from "./components/StaffLayout";
import UserLayout  from "./components/UserLayout";

// Auth pages
import Login  from "./pages/Login";
import Signup from "./pages/Signup";

// Staff pages
import Dashboard          from "./pages/Dashboard";
import ProductsList       from "./pages/ProductsList";
import AddProduct         from "./pages/AddProduct";
import EditProduct        from "./pages/EditProduct";
import StockIn            from "./pages/StockIn";
import StockOut           from "./pages/StockOut";
import StockMovements     from "./pages/StockMovements";
import StockReport        from "./pages/StockReport";
import Suppliers          from "./pages/Suppliers";
import EmployeeManagement from "./pages/EmployeeManagement";
import OrderManagement    from "./pages/OrderManagement";
import Profile            from "./pages/Profile";

// User (customer) pages
import Shop       from "./pages/Shop";
import Cart       from "./pages/Cart";
import MyOrders   from "./pages/MyOrders";
import UserDashboard from "./pages/UserDashboard";

function FullPageSpinner() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress size={48} />
    </Box>
  );
}

// Route guard
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role))
    return <Box sx={{ p: 4, textAlign: "center", color: "error.main", fontSize: "1.1rem" }}>⛔ Access Denied</Box>;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: "Inter, sans-serif", fontWeight: 500 } }} />
      <Routes>
        {/* Public auth */}
        <Route path="/login"  element={!user ? <Login />  : <Navigate to={user.role === "user" ? "/shop" : "/dashboard"} />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/shop" />} />

        {/* ── STAFF ROUTES (admin + employee) ── */}
        <Route path="/" element={<ProtectedRoute roles={["admin","employee"]}><StaffLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="products"   element={<ProductsList />} />
          <Route path="products/add"      element={<ProtectedRoute roles={["admin","employee"]}><AddProduct /></ProtectedRoute>} />
          <Route path="products/edit/:id" element={<ProtectedRoute roles={["admin","employee"]}><EditProduct /></ProtectedRoute>} />
          <Route path="stock/in"        element={<StockIn />} />
          <Route path="stock/out"       element={<StockOut />} />
          <Route path="stock/movements" element={<StockMovements />} />
          <Route path="stock/report"    element={<StockReport />} />
          <Route path="suppliers"       element={<Suppliers />} />
          <Route path="orders"          element={<OrderManagement />} />
          <Route path="employees"       element={<ProtectedRoute roles={["admin"]}><EmployeeManagement /></ProtectedRoute>} />
          <Route path="profile"         element={<Profile />} />
        </Route>

        {/* ── USER (CUSTOMER) ROUTES ── */}
        <Route path="/" element={<ProtectedRoute roles={["user"]}><UserLayout /></ProtectedRoute>}>
          <Route path="shop"        element={<Shop />} />
          <Route path="cart"        element={<Cart />} />
          <Route path="my-orders"   element={<MyOrders />} />
          <Route path="user-dashboard" element={<UserDashboard />} />
          <Route path="profile"     element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? (user.role === "user" ? "/shop" : "/dashboard") : "/login"} />} />
      </Routes>
    </Router>
  );
}
