# 📦 Inventory Management System (IMS)

Welcome to the **Inventory Management System**! This application is designed to help businesses track their products, manage staff, and handle customer orders all in one place.

---

## 🌟 What is this Project?
Think of this as a digital "Shop Manager." It helps a business owner (Admin) keep track of what they are selling, how much stock is left, and who is buying their products. It is built to be simple, clean, and professional.

### Major Sections:
1.  **Shop**: Where customers can browse and buy items.
2.  **Dashboard**: Where the owner sees total sales, low stock alerts, and recent activities.
3.  **Inventory**: A list of all products with their prices and quantities.
4.  **Order Management**: A place to approve or reject customer requests.

---

## 🚀 Step-by-Step: How the System Works
If you are presenting this project, here is the "Story" or "Flow" from start to finish:

1.  **Product Setup**: The **Admin** adds products (like "Laptop" or "Headphones") to the system, including the price, image, and how many are in stock.
2.  **Customer Shopping**: A **User (Customer)** creates an account and visits the **Shop**. They add items to their "Cart" and place an order.
3.  **Reviewing the Order**: The order appears on the **Staff Dashboard** as "Pending." An Admin or Employee reviews the order.
4.  **Approval & Stock Update**: 
    - If the staff clicks **Approve**, the system automatically subtracts the items from the warehouse stock.
    - If they click **Reject**, the order is cancelled, and the stock remains the same.
5.  **Tracking History**: Every time stock moves in or out, it is logged in a "Stock Movement" report so the owner knows exactly where the items went.

---

## 👥 Usage Roles (Who does what?)

### 👑 Admin (The Boss)
- Can do **everything** in the system.
- Manages employees (hiring or resetting passwords).
- Views full reports on profit and stock levels.

### 👷 Employee (The Staff)
- Helps manage the day-to-day work.
- Can add new stock when a delivery arrives ("Stock In").
- Can approve or reject customer orders.

### 🛍️ User (The Customer)
- Can sign up and create a profile.
- Browses the shop and places orders.
- Can see their own order history to track their purchases.

---

## 🛠️ How to Set Up the Project (For Students)

Follow these simple steps to run the project on your computer:

### 1. The Backend (The Brain)
1. Open your terminal/command prompt.
2. Go into the folder: `cd backend`
3. Install the tools needed: `npm install`
4. Create a file named `.env` and add your database link (Instructions in the `.env.example` file).
5. Start the server: `npm run dev`

### 2. The Frontend (The Face)
1. Open a **new** terminal.
2. Go into the folder: `cd frontend`
3. Install the tools needed: `npm install`
4. Start the website: `npm start`
5. Open your browser to: `http://localhost:3000`

---

## ☁️ How to Upload to GitHub (Step-by-Step)
If you want to save your work online or share it with others, use these commands in your main folder:

1. **Prepare the files**: `git add .`
2. **Save locally**: `git commit -m "Initial commit"`
3. **Connect to GitHub**: 
   `git remote add origin https://github.com/shaikalthaf7562-stack/Inventory-management-system.git`
4. **Set the main branch**: `git branch -M main`
5. **Upload**: `git push -u origin main`

---

### 🛡️ Technology Used (For Technical Students)
- **Frontend**: React.js with Material UI (for the beautiful design).
- **Backend**: Node.js and Express (to handle the logic).
- **Database**: MongoDB (to store all your data).
- **Security**: JWT (for safe login) and Bcrypt (to hide passwords).
