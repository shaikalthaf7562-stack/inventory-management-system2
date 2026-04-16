import React from "react";
import { Chip } from "@mui/material";

const configs = {
  // Order status
  Pending:  { color: "warning", label: "Pending" },
  Approved: { color: "success", label: "Approved" },
  Rejected: { color: "error",   label: "Rejected" },
  Cancelled:{ color: "default", label: "Cancelled" },
  // Product status
  Active:   { color: "success", label: "Active" },
  Inactive: { color: "default", label: "Inactive" },
  Discontinued:{ color: "error",label: "Discontinued" },
  // Movement type
  IN:  { color: "success", label: "IN ▲" },
  OUT: { color: "error",   label: "OUT ▼" },
  // Employee status
  true:  { color: "success", label: "Active" },
  false: { color: "error",   label: "Inactive" },
};

export default function StatusChip({ value }) {
  const cfg = configs[String(value)] || { color: "default", label: String(value) };
  return <Chip label={cfg.label} color={cfg.color} size="small" variant="filled" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />;
}
