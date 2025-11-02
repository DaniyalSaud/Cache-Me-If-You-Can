import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const seedAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Admin users to create
    const admins = [
      {
        username: "affan",
        phoneno: "1234567890",
        password: "admin123",
        role: "admin",
        region: "Mumbai",
      },
      {
        username: "abyaz",
        phoneno: "0987654321",
        password: "admin123",
        role: "admin",
        region: "Delhi",
      },
    ];

    // Create admins
    for (const adminData of admins) {
      // Check if admin already exists
      const existingAdmin = await User.findOne({
        $or: [{ username: adminData.username }, { phoneno: adminData.phoneno }],
      });

      if (existingAdmin) {
        console.log(`⚠️  Admin ${adminData.username} already exists, skipping...`);
        continue;
      }

      // Create new admin
      const admin = await User.create(adminData);
      console.log(`✅ Created admin: ${admin.username} (Phone: ${admin.phoneno})`);
    }

    console.log("\n🎉 Admin seeding completed!");
    console.log("\n📋 Admin Login Credentials:");
    console.log("─────────────────────────────────────");
    console.log("Admin 1:");
    console.log("  Username: affan");
    console.log("  Phone: 1234567890");
    console.log("  Password: admin123");
    console.log("─────────────────────────────────────");
    console.log("Admin 2:");
    console.log("  Username: abyaz");
    console.log("  Phone: 0987654321");
    console.log("  Password: admin123");
    console.log("─────────────────────────────────────");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admins:", error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmins();
