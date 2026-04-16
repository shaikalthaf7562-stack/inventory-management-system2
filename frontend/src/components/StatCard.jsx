import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";

export default function StatCard({ icon, label, value, color = "primary.main", sub }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2, p: 2.5 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: 2.5, flexShrink: 0,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem",
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ color, fontWeight: 800, lineHeight: 1.1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontWeight: 500 }}>{label}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
