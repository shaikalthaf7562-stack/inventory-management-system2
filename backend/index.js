/**
 * Inventory Management System (IMS) — Backend
 * Single-file Express + MongoDB server
 * Roles: admin | employee | user (customer)
 *
 * Flow:
 *  - Users can sign up and place orders (browse products, add to cart, checkout)
 *  - Orders start as "Pending"
 *  - Admin/Employee can Approve → stock deducted, or Reject → no stock change
 *  - Admin manages employees, products, suppliers
 *  - Employee (with canManageInventory) can manage products & stock
 */

const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// ─────────────────────────────────────────────
// DATABASE CONNECTION
// ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedAdmin();
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─────────────────────────────────────────────
// SCHEMAS & MODELS
// ─────────────────────────────────────────────

// User: admin | employee | user(customer)
const userSchema = new mongoose.Schema({
  fullName:           { type: String, required: true, trim: true },
  email:              { type: String, required: true, unique: true, lowercase: true },
  password:           { type: String, required: true },
  role:               { type: String, enum: ["admin", "employee", "user"], default: "user" },
  department:         { type: String, trim: true },
  phone:              { type: String, trim: true },
  address:            { type: String, trim: true },
  canManageInventory: { type: Boolean, default: false },
  isActive:           { type: Boolean, default: true },
}, { timestamps: true });

// Supplier
const supplierSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  contactPerson: { type: String, trim: true },
  email:         { type: String, lowercase: true, trim: true },
  phone:         { type: String, trim: true },
  address:       { type: String, trim: true },
  gstin:         { type: String, trim: true },
  notes:         { type: String, trim: true },
}, { timestamps: true });

// Product
const productSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  sku:               { type: String, required: true, unique: true, trim: true },
  category:          { type: String, trim: true },
  description:       { type: String, trim: true },
  unitPrice:         { type: Number, required: true, default: 0 },
  currentStock:      { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  reorderLevel:      { type: Number, default: 5 },
  supplier:          { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
  imageUrl:          { type: String, trim: true },
  status:            { type: String, enum: ["Active", "Inactive", "Discontinued"], default: "Active" },
  lastUpdatedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Stock Movement log
const movementSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  type:        { type: String, enum: ["IN", "OUT"], required: true },
  quantity:    { type: Number, required: true },
  reason:      { type: String, trim: true, default: "Adjustment" },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  note:        { type: String, trim: true },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
}, { timestamps: true });

// Order Item subdocument
const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:      { type: String },           // snapshot at order time
  sku:       { type: String },
  unitPrice: { type: Number },
  quantity:  { type: Number, required: true },
  subtotal:  { type: Number },
});

// Order
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items:       [orderItemSchema],
  totalAmount: { type: Number, default: 0 },
  status:      {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Cancelled"],
    default: "Pending",
  },
  note:           { type: String, trim: true },             // customer note
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  approvedAt:     { type: Date, default: null },
  rejectionReason:{ type: String, trim: true },
  shippingAddress:{ type: String, trim: true },
}, { timestamps: true });

// Auto-generate order number before save
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

const User     = mongoose.model("User",     userSchema);
const Supplier = mongoose.model("Supplier", supplierSchema);
const Product  = mongoose.model("Product",  productSchema);
const Movement = mongoose.model("Movement", movementSchema);
const Order    = mongoose.model("Order",    orderSchema);

// ─────────────────────────────────────────────
// SEED: Default Admin Account
// ─────────────────────────────────────────────
async function seedAdmin() {
  const adminEmail = "admin@ims.com";
  const defaultPass = "admin@2025";
  const hashed = await bcrypt.hash(defaultPass, 10);
  
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    await User.create({ fullName: "System Admin", email: adminEmail, password: hashed, role: "admin", isActive: true });
    console.log(`🔑 Created Admin Account → ${adminEmail} / ${defaultPass}`);
  } else {
    // Force update the password to make sure it's correct
    exists.password = hashed;
    exists.role = "admin";
    exists.isActive = true;
    await exists.save();
    console.log(`🔑 Admin Password Reset Successfully → ${adminEmail} / ${defaultPass}`);
  }
}


// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.fullName, email: user.email, canManageInventory: user.canManageInventory },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized — no token" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access only" });
  next();
};

const staffOnly = (req, res, next) => {
  if (!["admin", "employee"].includes(req.user.role))
    return res.status(403).json({ message: "Staff access only" });
  next();
};

const canManage = (req, res, next) => {
  if (req.user.role === "admin" || req.user.canManageInventory) return next();
  res.status(403).json({ message: "Inventory management permission required" });
};

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`📩 Login attempt for: ${email}`);
    
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    if (!user.isActive) return res.status(403).json({ message: "Account deactivated. Contact admin." });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log(`❌ Password mismatch for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    console.log(`✅ Login successful for: ${user.fullName}`);
    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.fullName, email: user.email, role: user.role, department: user.department, canManageInventory: user.canManageInventory },
    });
  } catch (err) { 
    console.error(`🔥 Login error: ${err.message}`);
    res.status(500).json({ message: err.message }); 
  }
});


// POST /api/auth/signup — public, creates "user" role (customer)
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, password, phone, address } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: "Name, email and password required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed, role: "user", phone, address });
    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, name: user.fullName, email: user.email, role: user.role, canManageInventory: false },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/me
app.get("/api/auth/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// PUT /api/auth/change-password
app.put("/api/auth/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "New password min 6 characters" });
    const user = await User.findById(req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─────────────────────────────────────────────
// DASHBOARD ROUTE
// ─────────────────────────────────────────────
app.get("/api/dashboard", protect, async (req, res) => {
  try {
    if (req.user.role === "user") {
      // Customer dashboard
      const myOrders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 }).limit(5).populate("items.product", "name imageUrl");
      const totalOrders   = await Order.countDocuments({ customer: req.user.id });
      const pendingOrders = await Order.countDocuments({ customer: req.user.id, status: "Pending" });
      const approvedOrders= await Order.countDocuments({ customer: req.user.id, status: "Approved" });
      return res.json({ myOrders, totalOrders, pendingOrders, approvedOrders });
    }

    // Staff dashboard
    const totalProducts  = await Product.countDocuments({ status: "Active" });
    const totalSuppliers = await Supplier.countDocuments();
    const totalUsers     = await User.countDocuments({ role: "user" });
    await Borrow_updateMany_placeholder(); // auto update overdue — not applicable here
    const lowStockItems  = await Product.countDocuments({ status: "Active", $expr: { $lte: ["$currentStock", "$lowStockThreshold"] } });
    const outOfStock     = await Product.countDocuments({ status: "Active", currentStock: 0 });
    const pendingOrders  = await Order.countDocuments({ status: "Pending" });
    const valueAgg       = await Product.aggregate([{ $match: { status: "Active" } }, { $group: { _id: null, total: { $sum: { $multiply: ["$unitPrice", "$currentStock"] } } } }]);
    const totalValue     = valueAgg[0]?.total || 0;
    const recentMovements= await Movement.find().populate("product", "name sku").populate("performedBy", "fullName").sort({ createdAt: -1 }).limit(12);
    const lowStockList   = await Product.find({ status: "Active", $expr: { $lte: ["$currentStock", "$lowStockThreshold"] } }).select("name sku currentStock lowStockThreshold").limit(8);
    const recentOrders   = await Order.find({ status: "Pending" }).populate("customer", "fullName email").sort({ createdAt: -1 }).limit(8);

    res.json({ totalProducts, totalSuppliers, totalUsers, lowStockItems, outOfStock, pendingOrders, totalValue, recentMovements, lowStockList, recentOrders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Dummy to avoid ReferenceError — nothing to borrow in IMS
async function Borrow_updateMany_placeholder() {}

// ─────────────────────────────────────────────
// PRODUCT ROUTES
// ─────────────────────────────────────────────
app.get("/api/products", protect, async (req, res) => {
  try {
    const { search = "", category = "", supplier = "", stockFilter = "", page = 1, limit = 12, all = "" } = req.query;
    const query = {};
    // Customers only see Active products
    if (req.user.role === "user") query.status = "Active";

    if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { sku: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }];
    if (category) query.category = { $regex: category, $options: "i" };
    if (supplier) query.supplier = supplier;
    if (stockFilter === "low")     query.$expr = { $and: [{ $gt: ["$currentStock", 0] }, { $lte: ["$currentStock", "$lowStockThreshold"] }] };
    if (stockFilter === "out")     query.currentStock = 0;
    if (stockFilter === "healthy") query.$expr = { $gt: ["$currentStock", "$lowStockThreshold"] };

    const pageLimit = all === "true" ? 500 : Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("supplier", "name")
      .populate("lastUpdatedBy", "fullName")
      .skip((page - 1) * pageLimit).limit(pageLimit).sort({ updatedAt: -1 });

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / pageLimit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/api/products/categories", protect, async (req, res) => {
  const cats = await Product.distinct("category", { category: { $ne: "" } });
  res.json(cats);
});

app.get("/api/products/:id", protect, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("supplier", "name email phone").populate("lastUpdatedBy", "fullName");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

app.post("/api/products", protect, canManage, async (req, res) => {
  try {
    const { name, sku, category, description, unitPrice, currentStock, lowStockThreshold, reorderLevel, supplier, imageUrl, status } = req.body;
    if (!name || !sku) return res.status(400).json({ message: "Name and SKU required" });
    const copies = Number(currentStock) || 0;
    const product = await Product.create({ name, sku, category, description, unitPrice, currentStock: copies, lowStockThreshold, reorderLevel, supplier: supplier || null, imageUrl, status, lastUpdatedBy: req.user.id });
    if (copies > 0) await Movement.create({ product: product._id, type: "IN", quantity: copies, reason: "Initial Stock", performedBy: req.user.id });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "SKU already exists" });
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/products/:id", protect, canManage, async (req, res) => {
  try {
    req.body.lastUpdatedBy = req.user.id;
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("supplier", "name").populate("lastUpdatedBy", "fullName");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete("/api/products/:id", protect, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { status: "Discontinued" }, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product discontinued" });
});

// ─────────────────────────────────────────────
// STOCK MOVEMENT ROUTES
// ─────────────────────────────────────────────
app.post("/api/stock/adjust", protect, staffOnly, async (req, res) => {
  try {
    const { productId, type, quantity, reason, note } = req.body;
    if (!productId || !type || !quantity) return res.status(400).json({ message: "productId, type, quantity required" });
    if (!["IN", "OUT"].includes(type)) return res.status(400).json({ message: "type must be IN or OUT" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const qty = Number(quantity);
    if (type === "OUT" && product.currentStock < qty)
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.currentStock}` });
    product.currentStock += type === "IN" ? qty : -qty;
    product.lastUpdatedBy = req.user.id;
    await product.save();
    const movement = await Movement.create({ product: productId, type, quantity: qty, reason: reason || (type === "IN" ? "Purchase" : "Sale"), performedBy: req.user.id, note });
    const populated = await movement.populate([{ path: "product", select: "name sku currentStock" }, { path: "performedBy", select: "fullName" }]);
    res.status(201).json({ movement: populated, newStock: product.currentStock });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/api/stock/movements", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, productId, type } = req.query;
    const query = {};
    if (req.user.role === "user") return res.status(403).json({ message: "Not authorized" });
    if (productId) query.product = productId;
    if (type) query.type = type;
    const total = await Movement.countDocuments(query);
    const movements = await Movement.find(query)
      .populate("product", "name sku")
      .populate("performedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    res.json({ movements, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─────────────────────────────────────────────
// ORDER ROUTES
// ─────────────────────────────────────────────

// POST /api/orders — customer places an order
app.post("/api/orders", protect, async (req, res) => {
  try {
    const { items, note, shippingAddress } = req.body;
    // items: [{ productId, quantity }]
    if (!items || items.length === 0) return res.status(400).json({ message: "Order must have at least one item" });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== "Active")
        return res.status(400).json({ message: `Product not available: ${item.productId}` });
      if (product.currentStock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for "${product.name}". Available: ${product.currentStock}` });
      const subtotal = product.unitPrice * item.quantity;
      totalAmount += subtotal;
      orderItems.push({ product: product._id, name: product.name, sku: product.sku, unitPrice: product.unitPrice, quantity: item.quantity, subtotal });
    }

    const order = await Order.create({
      customer: req.user.id, items: orderItems,
      totalAmount, note, shippingAddress,
      status: "Pending",
    });

    const populated = await order.populate("customer", "fullName email");
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders — staff sees all, user sees own
app.get("/api/orders", protect, async (req, res) => {
  try {
    const { status = "", page = 1, limit = 15 } = req.query;
    const query = {};
    if (req.user.role === "user") query.customer = req.user.id;
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("customer", "fullName email phone")
      .populate("approvedBy", "fullName")
      .populate("items.product", "name imageUrl sku")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders/:id
app.get("/api/orders/:id", protect, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer", "fullName email phone address")
    .populate("approvedBy", "fullName")
    .populate("items.product", "name imageUrl sku unitPrice");
  if (!order) return res.status(404).json({ message: "Order not found" });
  // User can only see their own
  if (req.user.role === "user" && order.customer._id.toString() !== req.user.id)
    return res.status(403).json({ message: "Access denied" });
  res.json(order);
});

// PUT /api/orders/:id/approve — staff approves → deduct stock
app.put("/api/orders/:id/approve", protect, staffOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Pending") return res.status(400).json({ message: `Order is already ${order.status}` });

    // Check stock for all items first
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.currentStock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for "${item.name}". Available: ${product?.currentStock ?? 0}` });
    }

    // Deduct stock and log movements
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { currentStock: -item.quantity },
        lastUpdatedBy: req.user.id,
      });
      await Movement.create({
        product: item.product._id, type: "OUT", quantity: item.quantity,
        reason: "Order Approved", performedBy: req.user.id,
        note: `Order #${order.orderNumber}`, orderId: order._id,
      });
    }

    order.status = "Approved";
    order.approvedBy = req.user.id;
    order.approvedAt = new Date();
    await order.save();

    const populated = await order.populate([{ path: "customer", select: "fullName email" }, { path: "approvedBy", select: "fullName" }]);
    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id/reject — staff rejects
app.put("/api/orders/:id/reject", protect, staffOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Pending") return res.status(400).json({ message: `Order is already ${order.status}` });
    order.status = "Rejected";
    order.approvedBy = req.user.id;
    order.approvedAt = new Date();
    order.rejectionReason = rejectionReason || "Rejected by staff";
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id/cancel — customer can cancel their own Pending order
app.put("/api/orders/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (req.user.role === "user" && order.customer.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });
    if (order.status !== "Pending") return res.status(400).json({ message: "Only pending orders can be cancelled" });
    order.status = "Cancelled";
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─────────────────────────────────────────────
// SUPPLIER ROUTES
// ─────────────────────────────────────────────
app.get("/api/suppliers", protect, async (req, res) => {
  const { search = "" } = req.query;
  const query = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { contactPerson: { $regex: search, $options: "i" } }] } : {};
  const suppliers = await Supplier.find(query).sort({ name: 1 });
  res.json(suppliers);
});

app.get("/api/suppliers/:id", protect, async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: "Supplier not found" });
  const products = await Product.find({ supplier: req.params.id }).select("name sku currentStock status unitPrice");
  res.json({ supplier, products });
});

app.post("/api/suppliers", protect, staffOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Supplier name required" });
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put("/api/suppliers/:id", protect, staffOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete("/api/suppliers/:id", protect, adminOnly, async (req, res) => {
  await Supplier.findByIdAndDelete(req.params.id);
  res.json({ message: "Supplier deleted" });
});

// ─────────────────────────────────────────────
// EMPLOYEE MANAGEMENT (admin only)
// ─────────────────────────────────────────────
app.get("/api/employees", protect, adminOnly, async (req, res) => {
  const employees = await User.find({ role: "employee" }).select("-password").sort({ createdAt: -1 });
  res.json(employees);
});

app.post("/api/employees", protect, adminOnly, async (req, res) => {
  try {
    const { fullName, email, password, department, canManageInventory } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: "Name, email, password required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const employee = await User.create({ fullName, email, password: hashed, role: "employee", department, canManageInventory: canManageInventory || false });
    const { password: _, ...safe } = employee.toObject();
    res.status(201).json(safe);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put("/api/employees/:id", protect, adminOnly, async (req, res) => {
  try {
    const { fullName, department, canManageInventory, newPassword } = req.body;
    const update = { fullName, department, canManageInventory };
    if (newPassword) {
      if (newPassword.length < 6) return res.status(400).json({ message: "Password min 6 chars" });
      update.password = await bcrypt.hash(newPassword, 10);
    }
    const employee = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch("/api/employees/:id/toggle", protect, adminOnly, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    employee.isActive = !employee.isActive;
    await employee.save();
    res.json({ message: `Account ${employee.isActive ? "activated" : "deactivated"}`, isActive: employee.isActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────
app.get("/api/reports/stock", protect, staffOnly, async (req, res) => {
  try {
    const all = await Product.find().populate("supplier", "name").select("name sku category currentStock lowStockThreshold reorderLevel unitPrice status supplier").sort({ currentStock: 1 });
    const outOfStock = all.filter((p) => p.currentStock === 0);
    const lowStock   = all.filter((p) => p.currentStock > 0 && p.currentStock <= p.lowStockThreshold);
    const healthy    = all.filter((p) => p.currentStock > p.lowStockThreshold);
    const totalValue = all.reduce((s, p) => s + p.unitPrice * p.currentStock, 0);
    res.json({ all, outOfStock, lowStock, healthy, totalValue });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users — admin can see all registered users (customers)
app.get("/api/users", protect, adminOnly, async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// ─────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ─────────────────────────────────────────────
// SERVE STATIC FRONTEND (PRODUCTION)
// ─────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "..", "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 Server is running!
📅 Date: ${new Date().toLocaleString()}
🔗 Local: http://localhost:${PORT}
🌐 Network: http://<your-ipv4-address>:${PORT}
  `);
});

