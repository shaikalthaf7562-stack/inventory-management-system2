import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Table, TableHead,
  TableBody, TableRow, TableCell, LinearProgress, Chip, Button,
  Tab, Tabs,
} from "@mui/material";
import { Assessment, Refresh } from "@mui/icons-material";
import axios from "axios";
import StatusChip from "../components/StatusChip";

const fmtCurrency = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

function StockBar({ current, threshold }) {
  const max   = Math.max(threshold * 3, current, 1);
  const pct   = Math.min((current / max) * 100, 100);
  const color = current === 0 ? "error" : current <= threshold ? "warning" : "success";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 120 }}>
      <LinearProgress
        variant="determinate" value={pct} color={color}
        sx={{ flex: 1, height: 8, borderRadius: 4 }}
      />
      <Typography variant="caption" fontWeight={700} color={`${color}.main`} sx={{ minWidth: 28 }}>
        {current}
      </Typography>
    </Box>
  );
}

export default function StockReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const fetchReport = () => {
    setLoading(true);
    axios.get("/api/reports/stock").then((r) => setReport(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchReport(); }, []);

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;
  if (!report)  return null;

  const tabs = [
    { label: `All (${report.all.length})`,             data: report.all },
    { label: `🚫 Out of Stock (${report.outOfStock.length})`, data: report.outOfStock },
    { label: `⚠️ Low Stock (${report.lowStock.length})`,     data: report.lowStock },
    { label: `✅ Healthy (${report.healthy.length})`,         data: report.healthy },
  ];

  const rows = tabs[tab].data;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: 2, background: "linear-gradient(135deg,#0284c7,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Assessment sx={{ color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="h4">Stock Report</Typography>
            <Typography color="text.secondary" variant="body2">
              Total inventory value: <strong>{fmtCurrency(report.totalValue)}</strong>
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchReport}>Refresh</Button>
      </Box>

      {/* Summary stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Products", value: report.all.length,        color: "primary.main"  },
          { label: "Out of Stock",   value: report.outOfStock.length, color: "error.main"    },
          { label: "Low Stock",      value: report.lowStock.length,   color: "warning.main"  },
          { label: "Healthy Stock",  value: report.healthy.length,    color: "success.main"  },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ textAlign: "center", py: 1 }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: s.color, fontWeight: 800 }}>{s.value}</Typography>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #e0e0ff", px: 2, pt: 1 }}>
          {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
        </Tabs>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Stock Level</TableCell>
              <TableCell align="right">Threshold</TableCell>
              <TableCell align="right">Reorder</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Stock Value</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No products in this category
                </TableCell>
              </TableRow>
            ) : rows.map((p) => (
              <TableRow key={p._id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ fontFamily: "monospace", bgcolor: "#f0f0ff", px: 0.75, py: 0.25, borderRadius: 1 }}>
                    {p.sku}
                  </Typography>
                </TableCell>
                <TableCell><Typography variant="body2">{p.category || "—"}</Typography></TableCell>
                <TableCell><StockBar current={p.currentStock} threshold={p.lowStockThreshold} /></TableCell>
                <TableCell align="right"><Typography variant="body2">{p.lowStockThreshold}</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2">{p.reorderLevel}</Typography></TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600} color="primary.main">{fmtCurrency(p.unitPrice)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>{fmtCurrency(p.unitPrice * p.currentStock)}</Typography>
                </TableCell>
                <TableCell><Typography variant="body2">{p.supplier?.name || "—"}</Typography></TableCell>
                <TableCell><StatusChip value={p.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
