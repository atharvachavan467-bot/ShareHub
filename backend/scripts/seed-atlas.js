import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../src/models/user.model.js";
import { Resource } from "../src/models/resource.model.js";
import { DB_NAME } from "../src/constants.js";

async function seed() {
  const rawUri = (process.env.MONGODB_URI || "mongodb://127.0.0.1:27017").trim().replace(/\/+$/, "");
  console.log("Connecting to:", `${rawUri}/${DB_NAME}`);
  await mongoose.connect(`${rawUri}/${DB_NAME}`, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected to MongoDB Atlas!");

  // Seed Borrower User
  let borrower = await User.findOne({ username: "atharva" });
  if (!borrower) {
    const hashedPassword = await bcrypt.hash("Atharva@123", 10);
    borrower = await User.create({
      username: "atharva",
      email: "atharva@apex.edu",
      fullname: "Atharva Chavan",
      password: hashedPassword,
      IdentityNumber: 881023,
      isIdentityVerified: true,
      trustScore: 98,
      role: "USER",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    });
    console.log("Created borrower: atharva");
  } else {
    console.log("Borrower atharva already exists");
  }

  // Seed Owner User
  let owner = await User.findOne({ username: "dr_smith" });
  if (!owner) {
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    owner = await User.create({
      username: "dr_smith",
      email: "faculty.lead@apex.edu",
      fullname: "Dr. Evelyn Smith",
      password: hashedPassword,
      IdentityNumber: 442901,
      isIdentityVerified: true,
      trustScore: 100,
      role: "OWNER",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    });
    console.log("Created owner: dr_smith");
  } else {
    console.log("Owner dr_smith already exists");
  }

  // Check existing resources
  const resourceCount = await Resource.countDocuments();
  if (resourceCount === 0) {
    const sampleResources = [
      {
        ownerId: owner._id,
        title: "JEOL JEM-2100F Field Emission TEM",
        description: "High-resolution 200kV transmission electron microscope equipped with STEM, EDS detector, and cryo-transfer holder for nanoscale atomic imaging.",
        category: "PRODUCT",
        image: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=800&q=80"
        ],
        location: {
          firstLine: "Advanced Microscopy Wing, Room B-12",
          secondLine: "Department of Materials Science",
          country: "India",
          state: "Maharashtra"
        },
        pricingType: "PER_HOUR",
        pricePerUnit: 120,
        securityDeposit: 500,
        termsAndCondition: "Mandatory qualification certificate required. User must submit pre-run checklist. Liquid nitrogen handling rules apply.",
        requiredQualification: ["TEM-Cert-L3", "CryoSafety-2024"],
        requireSupervision: false,
        status: "AVAILABLE",
        maxBookingDays: 3
      },
      {
        ownerId: owner._id,
        title: "Illumina NovaSeq 6000 High-Throughput Sequencer",
        description: "Ultra-high-throughput sequencing platform capable of producing up to 6 Tb of data and 20 billion reads per dual-flow-cell run. Ideal for WGS, single-cell, and RNA-seq.",
        category: "PRODUCT",
        image: [
          "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80"
        ],
        location: {
          firstLine: "Genomics Research Core, Lab 304",
          secondLine: "Center for Biotechnology",
          country: "India",
          state: "Maharashtra"
        },
        pricingType: "PER_DAY",
        pricePerUnit: 450,
        securityDeposit: 1000,
        termsAndCondition: "Reagent kits must be verified by Lab Manager. Data transfer protocol strictly enforced.",
        requiredQualification: ["BioSafety-L2", "NGS-Operator-Gold"],
        requireSupervision: true,
        status: "AVAILABLE",
        maxBookingDays: 5
      },
      {
        ownerId: owner._id,
        title: "Haas UMC-750 5-Axis CNC Machining Center",
        description: "Versatile 5-axis vertical machining center with 40-taper spindle, 30+1 tool changer, and integrated high-speed trunnion rotary table for rapid prototyping.",
        category: "PRODUCT",
        image: [
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
        ],
        location: {
          firstLine: "Precision Engineering Hangar, Bay 4",
          secondLine: "Mechanical Fabrication Complex",
          country: "India",
          state: "Maharashtra"
        },
        pricingType: "PER_HOUR",
        pricePerUnit: 75,
        securityDeposit: 300,
        termsAndCondition: "G-Code simulation verification required before live spindle engagement. Safety glasses and steel-toe boots mandatory.",
        requiredQualification: ["CNC-Machinist-Pro"],
        requireSupervision: false,
        status: "AVAILABLE",
        maxBookingDays: 2
      },
      {
        ownerId: owner._id,
        title: "NMR Spectroscopy Analysis & Consultation Service",
        description: "Expert-assisted 600 MHz Bruker NMR analysis for small molecule characterization, 1D/2D spectrum interpretation, and conformational dynamics consulting.",
        category: "SERVICE",
        image: [
          "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80"
        ],
        location: {
          firstLine: "Analytical Chemistry Complex, Suite 108",
          secondLine: "School of Chemical Sciences",
          country: "India",
          state: "Maharashtra"
        },
        pricingType: "PER_HOUR",
        pricePerUnit: 90,
        securityDeposit: 150,
        termsAndCondition: "Samples must be deuterated and filtered through 0.45um PTFE filters prior to handoff.",
        requiredQualification: ["Chemical-Safety-Standard"],
        requireSupervision: true,
        status: "AVAILABLE",
        maxBookingDays: 7
      }
    ];

    const inserted = await Resource.insertMany(sampleResources);
    console.log(`Seeded ${inserted.length} resources`);
  } else {
    console.log(`Resources already exist (${resourceCount} found)`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
