import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, Button, Table, TableHead, TableBody,
  TableRow, TableCell, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, FormControlLabel, Checkbox,
  Chip, Switch,
} from "@mui/material";
import { Add, Edit, PersonOff, PersonAdd } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import StatusChip from "../components/StatusChip";

const emptyForm = { fullName: "", email: "", password: "", department: "", canManageInventory: false };

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [dialog, setDialog]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [resetPwd, setResetPwd]   = useState("");

  const fetchEmployees = () => {
    axios.get("/api/employees").then((r) => setEmployees(r.data));
  };
  useEffect(() => { fetchEmployees(); }, []);

  const handleOpen = (emp = null) => {
    setForm(emp
      ? { fullName: emp.fullName, email: emp.email, password: "", department: emp.department || "", canManageInventory: emp.canManageInventory }
      : emptyForm
    );
    setEditingId(emp?._id || null);
    setResetPwd("");
    setDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        const payload = { fullName: form.fullName, department: form.department, canManageInventory: form.canManageInventory };
        if (resetPwd) payload.newPassword = resetPwd;
        await axios.put(`/api/employees/${editingId}`, payload);
        toast.success("Employee updated!");
      } else {
        if (!form.fullName || !form.email || !form.password) return toast.error("Name, email, password required");
        await axios.post("/api/employees", form);
        toast.success("Employee created!");
      }
      setDialog(false); fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.patch(`/api/employees/${id}/toggle`);
      toast.success(data.message); fetchEmployees();
    } catch { toast.error("Toggle failed"); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4">Employee Management</Typography>
          <Typography color="text.secondary" variant="body2">Manage staff accounts and permissions</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Employee</Button>
      </Box>

      <Card>
        <Table>
          <TableHead><TableRow>
            <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Department</TableCell>
            <TableCell>Can Manage</TableCell><TableCell>Status</TableCell>
            <TableCell>Joined</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>No employees yet</TableCell></TableRow>
            ) : employees.map((e) => (
              <TableRow key={e._id}>
                <TableCell><Typography fontWeight={600}>{e.fullName}</Typography></TableCell>
                <TableCell><Typography variant="body2">{e.email}</Typography></TableCell>
                <TableCell>{e.department || "—"}</TableCell>
                <TableCell>
                  <Chip label={e.canManageInventory ? "Yes" : "No"} size="small"
                    color={e.canManageInventory ? "success" : "default"} />
                </TableCell>
                <TableCell><StatusChip value={String(e.isActive)} /></TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => handleOpen(e)}>Edit</Button>
                    <Button size="small" variant="outlined" color={e.isActive ? "warning" : "success"}
                      startIcon={e.isActive ? <PersonOff /> : <PersonAdd />} onClick={() => handleToggle(e._id)}>
                      {e.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name *" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Warehouse" />
            </Grid>
            {!editingId && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </Grid>
              </>
            )}
            {editingId && (
              <Grid item xs={12}>
                <TextField fullWidth label="Reset Password (leave blank to keep)" type="password" value={resetPwd} onChange={(e) => setResetPwd(e.target.value)} placeholder="Enter new password or leave blank" />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel control={
                <Checkbox checked={form.canManageInventory} onChange={(e) => setForm({ ...form, canManageInventory: e.target.checked })} />
              } label="Can Manage Inventory (add/edit products)" />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                If unchecked, employee can view products and adjust stock only
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? "Update Employee" : "Create Employee"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
