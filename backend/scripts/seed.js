import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { Resource } from "../src/models/resource.model.js";
import { DB_NAME } from "../src/constants.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function seed() {
  await mongoose.connect(`${process.env.MONGODB_URI || "mongodb://127.0.0.1:27017"}/${DB_NAME}`);
  console.log("Connected to DB for seeding.");

  // Check if owner user exists
  let owner = await User.findOne({ email: "faculty.lead@apex.edu" });
  if (!owner) {
    owner = await User.create({
      username: "dr_smith",
      email: "faculty.lead@apex.edu",
      fullname: "Dr. Eleanor Smith",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      password: "Password123!",
      trustScore: 98,
      IdentityNumber: 100982,
      isIdentityVerified: true,
      role: "OWNER",
    });
    console.log("Seeded Owner User:", owner.email);
  }

  // Create demo borrower user
  let borrower = await User.findOne({ email: "student@apex.edu" });
  if (!borrower) {
    borrower = await User.create({
      username: "alex_chen",
      email: "student@apex.edu",
      fullname: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      password: "Password123!",
      trustScore: 92,
      IdentityNumber: 20268841,
      isIdentityVerified: true,
      role: "USER",
    });
    console.log("Seeded Borrower User:", borrower.email);
  }

  const count = await Resource.countDocuments();
  if (count === 0) {
    await Resource.insertMany([
      {
        ownerId: owner._id,
        title: "Formlabs Form 4 SLA Precision 3D Printer",
        description: "Industrial stereolithography 3D printer for nanometer-accurate dental, biomedical, and mechanical prototyping. High-speed Low Force Display (LFD) print engine with automated resin dispensing.",
        category: "PRODUCT",
        pricingType: "PER_DAY",
        pricePerUnit: 35,
        securityDeposit: 150,
        termsAndCondition: "Must wear nitrile gloves and UV eye protection. Clean resin vat with 99% isopropyl alcohol after every cycle.",
        maxBookingDays: 5,
        requireSupervision: false,
        status: "AVAILABLE",
        location: {
          firstLine: "Clean Fabrication Room 204",
          secondLine: "Materials Science Complex",
          state: "California",
          country: "United States",
        },
        requiredQualification: ["3D_PRINTER_SOP"],
        image: [
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80"
        ],
      },
      {
        ownerId: owner._id,
        title: "Coherent Monaco Femtosecond Laser Micro-Machining Station",
        description: "High-repetition-rate femtosecond laser system capable of sub-micron precision ablation, semiconductor wafer dicing, and photonic waveguide fabrication.",
        category: "PRODUCT",
        pricingType: "PER_HOUR",
        pricePerUnit: 45,
        securityDeposit: 300,
        termsAndCondition: "Strict Class IV laser safety qualification required. Interlock door must be engaged throughout operation.",
        maxBookingDays: 3,
        requireSupervision: true,
        status: "AVAILABLE",
        location: {
          firstLine: "Ultrafast Optics Bay 4",
          secondLine: "Quantum Engineering Wing",
          state: "California",
          country: "United States",
        },
        requiredQualification: ["LASER_SAFETY_LEVEL_1"],
        image: [
          "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80"
        ],
      },
      {
        ownerId: owner._id,
        title: "High-Throughput Cell Sorting & Flow Cytometry Service",
        description: "Assisted fluorescence-activated cell sorting (FACS) service with dual-laser excitation and 6-color optical filtration for cellular immunology assays.",
        category: "SERVICE",
        pricingType: "PER_HOUR",
        pricePerUnit: 60,
        securityDeposit: 100,
        termsAndCondition: "Samples must be pre-filtered through 40um mesh. Bio-Safety Level 2 clearance required.",
        maxBookingDays: 1,
        requireSupervision: true,
        status: "AVAILABLE",
        location: {
          firstLine: "Bio-Safety Level 2 Core",
          secondLine: "Health Sciences Tower",
          state: "California",
          country: "United States",
        },
        requiredQualification: ["BIO_SAFETY_LEVEL_2"],
        image: [
          "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80"
        ],
      }
    ]);
    console.log("Seeded 3 sample equipment resources!");
  }

  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
