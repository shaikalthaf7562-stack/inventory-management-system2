import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, LinearProgress } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { ProductForm } from "./AddProduct";

export default function EditProduct() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(({ data }) => setInitialData({
        name: data.name, sku: data.sku, category: data.category || "",
        description: data.description || "", unitPrice: data.unitPrice,
        currentStock: data.currentStock, lowStockThreshold: data.lowStockThreshold,
        reorderLevel: data.reorderLevel, supplier: data.supplier?._id || "",
        imageUrl: data.imageUrl || "", status: data.status,
      }))
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LinearProgress />;
  if (!initialData) return <Typography color="error" sx={{ p: 3 }}>Product not found</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>✏️ Edit Product</Typography>
      <ProductForm initialData={initialData} productId={id} />
    </Box>
  );
}
