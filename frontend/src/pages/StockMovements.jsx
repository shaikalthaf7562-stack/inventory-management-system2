import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Table, TableHead, TableBody, TableRow,
  TableCell, Chip, Select, MenuItem, FormControl, InputLabel,
  Pagination, Button,
} from "@mui/material";
import { SwapVert, Refresh } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import StatusChip from "../components/StatusChip";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);

  const fetchMovements = useCallback(() => {
    setLoading(true);
    axios
      .get("/api/stock/movements", { params: { type: typeFilter, page, limit: 20 } })
      .then((r) => {
        setMovements(r.data.movements);
        setTotalPages(r.data.pages);
        setTotal(r.data.total);
      })
      .catch(() => toast.error("Failed to load movements"))
      .finally(() => setLoading(false));
  }, [typeFilter, page]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: 2, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SwapVert sx={{ color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="h4">Stock Movements</Typography>
            <Typography color="text.secondary" variant="body2">{total} total entries</Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchMovements}>Refresh</Button>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2.5 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select label="Filter by Type" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">All Movements</MenuItem>
            <MenuItem value="IN">▲ Stock In only</MenuItem>
            <MenuItem value="OUT">▼ Stock Out only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Date & Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>Loading...</TableCell>
              </TableRow>
            ) : movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>No movements found</TableCell>
              </TableRow>
            ) : movements.map((m, i) => (
              <TableRow key={m._id}>
                <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                  {(page - 1) * 20 + i + 1}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{m.product?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{m.product?.sku}</Typography>
                </TableCell>
                <TableCell><StatusChip value={m.type} /></TableCell>
                <TableCell align="right">
                  <Typography fontWeight={700} color={m.type === "IN" ? "success.main" : "error.main"}>
                    {m.type === "IN" ? "+" : "-"}{m.quantity}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={m.reason} size="small" variant="outlined" sx={{ fontSize: "0.72rem" }} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{m.note || "—"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{m.performedBy?.fullName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{fmtDate(m.createdAt)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
