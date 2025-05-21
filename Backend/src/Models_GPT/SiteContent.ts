// models/SiteContent.ts

import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["homepage", "auspiciouspage", "aboutpage", "contactpage"],
    },
    fields: {
      type: mongoose.Schema.Types.Mixed, // ยืดหยุ่นเก็บ object ได้
      required: true,
    },
  },
  { _id: false }
);

const siteContentSchema = new mongoose.Schema(
  {
    pages: [pageSchema], // <-- 🔥 เก็บทุกหน้าใน array
  },
  {
    collection: "SiteContent",
    timestamps: true,
  }
);

export const SiteContent = mongoose.model("SiteContent", siteContentSchema);
