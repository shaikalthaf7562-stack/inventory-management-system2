const mongoose = require("mongoose");
require("dotenv").config();

console.log("Connecting to:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    
    // Define minimal models for testing
    const User = mongoose.model("User", new mongoose.Schema({}));
    const Product = mongoose.model("Product", new mongoose.Schema({}));
    const Supplier = mongoose.model("Supplier", new mongoose.Schema({}));
    const Order = mongoose.model("Order", new mongoose.Schema({}));

    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const supplierCount = await Supplier.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log("Users:", userCount);
    console.log("Products:", productCount);
    console.log("Suppliers:", supplierCount);
    console.log("Orders:", orderCount);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
