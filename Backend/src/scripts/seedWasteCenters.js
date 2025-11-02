import mongoose from "mongoose";
import { WasteCenter } from "../models/wastecenter.models.js";
import dotenv from "dotenv";

dotenv.config();

const wasteCenters = [
  {
    name: "Lahore Green Waste Collection Center",
    location: {
      type: "Point",
      coordinates: [74.3587, 31.5204] // [longitude, latitude] - Lahore city center
    },
    address: "Ferozepur Road, Near Liberty Market, Gulberg III",
    city: "Lahore",
    division: "Punjab",
    country: "Pakistan",
    contactNumber: "+92-42-35713456",
    acceptedCropTypes: ["All"],
    currentCapacity: 50,
    maxCapacity: 500
  },
  {
    name: "Multan Agricultural Waste Management",
    location: {
      type: "Point",
      coordinates: [71.5249, 30.1575] // Multan
    },
    address: "Bosan Road, Near Six Road Chowk",
    city: "Multan",
    division: "Punjab",
    country: "Pakistan",
    contactNumber: "+92-61-4586789",
    acceptedCropTypes: ["Rice", "Wheat", "Sugarcane", "Cotton", "Corn"],
    currentCapacity: 120,
    maxCapacity: 600
  },
  {
    name: "Kasur Crop Waste Recycling Hub",
    location: {
      type: "Point",
      coordinates: [74.4507, 31.1180] // Kasur (village near Lahore)
    },
    address: "GT Road, Kasur City",
    city: "Kasur",
    division: "Punjab",
    country: "Pakistan",
    contactNumber: "+92-49-2456123",
    acceptedCropTypes: ["Rice", "Wheat", "Potato", "Onion", "Carrot"],
    currentCapacity: 30,
    maxCapacity: 300
  },
  {
    name: "Okara Green Solutions Center",
    location: {
      type: "Point",
      coordinates: [73.4450, 30.8100] // Okara (agricultural district)
    },
    address: "Railway Road, Near DHQ Hospital",
    city: "Okara",
    division: "Punjab",
    country: "Pakistan",
    contactNumber: "+92-44-2512456",
    acceptedCropTypes: ["Wheat", "Sugarcane", "Cotton", "Soybean", "Corn"],
    currentCapacity: 75,
    maxCapacity: 450
  },
  {
    name: "Sahiwal Organic Waste Management",
    location: {
      type: "Point",
      coordinates: [73.1060, 30.6680] // Sahiwal
    },
    address: "Farid Town, Near Railway Station",
    city: "Sahiwal",
    division: "Punjab",
    country: "Pakistan",
    contactNumber: "+92-40-4520789",
    acceptedCropTypes: ["All"],
    currentCapacity: 90,
    maxCapacity: 550
  },
  {
    name: "Khanewal Agricultural Recycling Facility",
    location: {
      type: "Point",
      coordinates: [71.9321, 30.3017] // Khanewal (village/small city)
    },
    address: "Multan Road, Industrial Area",
    city: "Khanewal",
    division: "Punjab",
    country: "Pakistan",
    contactNumber: "+92-65-2458912",
    acceptedCropTypes: ["Rice", "Wheat", "Cotton", "Tomato", "Pepper", "Cucumber"],
    currentCapacity: 45,
    maxCapacity: 400
  }
];

async function seedWasteCenters() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if centers already exist
    const existingCenters = await WasteCenter.find({
      name: { $in: wasteCenters.map(c => c.name) }
    });

    if (existingCenters.length > 0) {
      console.log(`⚠️  Found ${existingCenters.length} existing centers with same names.`);
      console.log("Existing centers:", existingCenters.map(c => c.name));
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question('Do you want to delete them and add new ones? (yes/no): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        await WasteCenter.deleteMany({
          name: { $in: wasteCenters.map(c => c.name) }
        });
        console.log("🗑️  Deleted existing centers");
      } else {
        console.log("❌ Seeding cancelled");
        process.exit(0);
      }
    }

    // Insert waste centers
    const result = await WasteCenter.insertMany(wasteCenters);
    
    console.log("\n✅ Successfully seeded waste centers!");
    console.log(`📍 Added ${result.length} waste centers:\n`);
    
    result.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name}`);
      console.log(`   📍 Location: ${center.city}, ${center.division}`);
      console.log(`   🌾 Accepts: ${center.acceptedCropTypes.join(", ")}`);
      console.log(`   📦 Capacity: ${center.currentCapacity}/${center.maxCapacity} tons`);
      console.log(`   📞 Contact: ${center.contactNumber}\n`);
    });

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding waste centers:", error);
    process.exit(1);
  }
}

// Run the seed function
seedWasteCenters();
