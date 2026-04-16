import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Button, TextField, Grid,
  Table, TableHead, TableBody, TableRow, TableCell, Dialog,
  DialogTitle, DialogContent, DialogActions, InputAdornment,
  IconButton, Collapse,
} from "@mui/material";
import { Add, Edit, Delete, Search, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import StatusChip from "../components/StatusChip";

const emptyForm = { name: "", contactPerson: "", email: "", phone: "", address: "", gstin: "", notes: "" };

function SupplierRow({ supplier, onEdit, onDelete, isAdmin }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    if (!open) {
      const { data } = await axios.get(`/api/suppliers/${supplier._id}`);
      setProducts(data.products);
    }
    setOpen(!open);
  };

  return (
    <>
      <TableRow>
        <TableCell><IconButton size="small" onClick={loadProducts}>{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton></TableCell>
        <TableCell><Typography fontWeight={600}>{supplier.name}</Typography></TableCell>
        <TableCell>{supplier.contactPerson || "—"}</TableCell>
        <TableCell>{supplier.email || "—"}</TableCell>
        <TableCell>{supplier.phone || "—"}</TableCell>
        <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace" }}>{supplier.gstin || "—"}</Typography></TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {isAdmin && <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => onEdit(supplier)}>Edit</Button>}
            {isAdmin && <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => onDelete(supplier._id)}>Delete</Button>}
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, bgcolor: "#f8faff" }}>
          <Collapse in={open}>
            <Box sx={{ py: 2, px: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Products from {supplier.name}</Typography>
              {products.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No products linked</Typography>
              ) : (
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Name</TableCell><TableCell>SKU</TableCell>
                    <TableCell align="right">Stock</TableCell><TableCell align="right">Price</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace" }}>{p.sku}</Typography></TableCell>
                        <TableCell align="right">{p.currentStock}</TableCell>
                        <TableCell align="right">₹{p.unitPrice?.toLocaleString("en-IN")}</TableCell>
                        <TableCell><StatusChip value={p.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function Suppliers() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchSuppliers = () => {
    axios.get("/api/suppliers", { params: { search } }).then((r) => setSuppliers(r.data));
  };
  useEffect(() => { fetchSuppliers(); }, [search]);

  const handleOpen = (s = null) => {
    setForm(s ? { name: s.name, contactPerson: s.contactPerson || "", email: s.email || "", phone: s.phone || "", address: s.address || "", gstin: s.gstin || "", notes: s.notes || "" } : emptyForm);
    setEditingId(s?._id || null);
    setDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.name) return toast.error("Supplier name required");
    try {
      if (editingId) { await axios.put(`/api/suppliers/${editingId}`, form); toast.success("Updated!"); }
      else           { await axios.post("/api/suppliers", form); toast.success("Supplier added!"); }
      setDialog(false); fetchSuppliers();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try { await axios.delete(`/api/suppliers/${id}`); toast.success("Deleted"); fetchSuppliers(); }
    catch { toast.error("Delete failed"); }
  };

  const ff = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Suppliers</Typography>
        {isAdmin && <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Supplier</Button>}
      </Box>

      <TextField placeholder="Search suppliers..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2.5, minWidth: 280 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
      />

      <Card>
        <Table>
          <TableHead><TableRow>
            <TableCell /><TableCell>Name</TableCell><TableCell>Contact</TableCell>
            <TableCell>Email</TableCell><TableCell>Phone</TableCell><TableCell>GSTIN</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>No suppliers found</TableCell></TableRow>
            ) : suppliers.map((s) => (
              <SupplierRow key={s._id} supplier={s} onEdit={handleOpen} onDelete={handleDelete} isAdmin={isAdmin} />
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Supplier Name *" required {...ff("name")} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Contact Person" {...ff("contactPerson")} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" type="email" {...ff("email")} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" {...ff("phone")} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="GSTIN / PAN" {...ff("gstin")} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Address" {...ff("address")} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={2} {...ff("notes")} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? "Update" : "Add Supplier"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
