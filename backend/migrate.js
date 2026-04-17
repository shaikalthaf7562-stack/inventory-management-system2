const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();

const LOCAL_URI = "mongodb://127.0.0.1:27017/inventory-management-system";
const ATLAS_URI = process.env.MONGO_URI;

async function migrate() {
    console.log("🚀 Starting Migration...");
    console.log("📍 Source: ", LOCAL_URI);
    console.log("📍 Target: ", ATLAS_URI);

    let localConn, atlasConn;

    try {
        // 1. Connect to Local
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log("✅ Connected to Local MongoDB");

        // 2. Connect to Atlas
        atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log("✅ Connected to MongoDB Atlas");

        const collections = ["products", "users", "suppliers", "orders", "movements"];

        for (const colName of collections) {
            console.log(`📦 Migrating collection: ${colName}...`);
            
            const localCol = localConn.collection(colName);
            const atlasCol = atlasConn.collection(colName);

            const data = await localCol.find({}).toArray();
            console.log(`   Found ${data.length} documents in ${colName}`);

            if (data.length > 0) {
                // Clear existing data in Atlas for a clean start (Optional)
                await atlasCol.deleteMany({});
                
                // Insert into Atlas
                await atlasCol.insertMany(data);
                console.log(`   ✅ Successfully migrated ${data.length} documents to ${colName}`);
            } else {
                console.log(`   ⚠️ No documents found in ${colName}. Skipping.`);
            }
        }

        console.log("\n🎉 DATA MIGRATION COMPLETE!");
        console.log("You can now check your MongoDB Atlas Data Explorer.");
        
    } catch (err) {
        console.error("\n❌ MIGRATION FAILED:");
        if (err.message.includes("Authentication failed")) {
            console.error("👉 AUTHENTICATION ERROR: The username or password in your .env file is wrong.");
        } else if (err.code === "ECONNREFUSED" || err.message.includes("timeout")) {
            console.error("👉 NETWORK ERROR: Please check your IP Whitelist in Atlas.");
        } else {
            console.error(err);
        }
    } finally {
        if (localConn) await localConn.close();
        if (atlasConn) await atlasConn.close();
        process.exit(0);
    }
}

migrate();
